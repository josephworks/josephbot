import { Client, EmbedBuilder, TextChannel } from 'discord.js'
import { prisma } from '../functions'

interface MALAnimeEntry {
    anime_title: string
    anime_image_path: string
    score: number
    status: number
    anime_url: string
    anime_num_episodes: number
    num_watched_episodes: number
    created_at: number
    updated_at: number
}

const STATUS_LABELS: Record<number, string> = {
    1: 'Watching',
    2: 'Completed',
    3: 'On Hold',
    4: 'Dropped',
    6: 'Plan to Watch'
}

const STATUS_COLORS: Record<number, number> = {
    1: 0x2db039, // green - watching
    2: 0x26448f, // blue - completed
    3: 0xf9d457, // yellow - on hold
    4: 0xa12f31, // red - dropped
    6: 0xc3c3c3  // grey - plan to watch
}

async function fetchAnimeList(): Promise<MALAnimeEntry[]> {
    const entries: MALAnimeEntry[] = []
    try {
        for (let offset = 0; ; offset += 300) {
            const res = await fetch(
                `https://myanimelist.net/animelist/josephworks/load.json?offset=${offset}&status=7`
            )
            if (!res.ok) break
            const batch = await res.json() as MALAnimeEntry[]
            if (batch.length === 0) break
            entries.push(...batch)
            if (batch.length < 300) break
        }
    } catch {
        // Return whatever we collected so far
    }
    return entries
}

function getAnimeUrl(entry: MALAnimeEntry): string {
    return `https://myanimelist.net${entry.anime_url}`
}

function getImageUrl(entry: MALAnimeEntry): string {
    if (!entry.anime_image_path) return ''
    return entry.anime_image_path.startsWith('//')
        ? `https:${entry.anime_image_path}`
        : entry.anime_image_path
}

export default async function (client: Client<boolean>) {
    const animeList = await fetchAnimeList()
    if (animeList.length === 0) return

    const channel = client.guilds.cache.get(process.env.GUILD_ID!)
        ?.channels.cache.get('1102397723019325500') as TextChannel | undefined
    if (!channel) return

    for (const entry of animeList) {
        const animeId = entry.anime_url // stable MAL path like "/anime/12345/Title"

        try {
            const existing = await prisma.josephAnime.findFirst({
                where: { animeId },
                orderBy: { updatedAt: 'desc' }
            })

            if (!existing) {
                // New anime added to the list
                await prisma.josephAnime.create({
                    data: {
                        animeId,
                        title: entry.anime_title,
                        imageUrl: getImageUrl(entry),
                        status: entry.status,
                        score: entry.score,
                        numWatchedEpisodes: entry.num_watched_episodes,
                        numTotalEpisodes: entry.anime_num_episodes,
                        createdAt: new Date(entry.created_at * 1000),
                        updatedAt: new Date(entry.updated_at * 1000)
                    }
                })

                const embed = buildEmbed(entry, 'Added to anime list')
                await channel.send({ embeds: [embed] })

            } else {
                // Check for changes
                const statusChanged = existing.status !== entry.status
                const episodesChanged = existing.numWatchedEpisodes !== entry.num_watched_episodes
                const scoreChanged = existing.score !== entry.score

                if (statusChanged || episodesChanged || scoreChanged) {
                    await prisma.josephAnime.create({
                        data: {
                            animeId,
                            title: entry.anime_title,
                            imageUrl: getImageUrl(entry),
                            status: entry.status,
                            score: entry.score,
                            numWatchedEpisodes: entry.num_watched_episodes,
                            numTotalEpisodes: entry.anime_num_episodes,
                            createdAt: new Date(entry.created_at * 1000),
                            updatedAt: new Date(entry.updated_at * 1000)
                        }
                    })

                    let description = ''
                    if (statusChanged) {
                        const oldStatus = STATUS_LABELS[existing.status] ?? 'Unknown'
                        const newStatus = STATUS_LABELS[entry.status] ?? 'Unknown'
                        description = `${oldStatus} → ${newStatus}`
                    } else if (episodesChanged) {
                        description = `Watched episode ${entry.num_watched_episodes}` +
                            (entry.anime_num_episodes > 0 ? ` of ${entry.anime_num_episodes}` : '')
                    } else if (scoreChanged && entry.score > 0) {
                        description = `Score updated to ${entry.score}/10`
                    }

                    const embed = buildEmbed(entry, description)
                    await channel.send({ embeds: [embed] })
                }
            }
        } catch (err) {
            console.error(err)
        }
    }
}

function buildEmbed(entry: MALAnimeEntry, description: string): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(entry.anime_title)
        .setURL(getAnimeUrl(entry))
        .setDescription(description)
        .setColor(STATUS_COLORS[entry.status] ?? 0x00bfff)
        .setTimestamp(new Date(entry.updated_at * 1000))
        .setFooter({
            text: 'JosephWorks Discord Bot',
            iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
        })

    const imageUrl = getImageUrl(entry)
    if (imageUrl) {
        embed.setThumbnail(imageUrl)
    }

    const statusLabel = STATUS_LABELS[entry.status] ?? 'Unknown'
    embed.addFields({ name: 'Status', value: statusLabel, inline: true })

    if (entry.anime_num_episodes > 0) {
        embed.addFields({
            name: 'Progress',
            value: `${entry.num_watched_episodes}/${entry.anime_num_episodes} episodes`,
            inline: true
        })
    }

    if (entry.status === 2 && entry.score > 0) {
        embed.addFields({ name: 'Score', value: `⭐ ${entry.score}/10`, inline: true })
    }

    return embed
}

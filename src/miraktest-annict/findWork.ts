import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { Program } from "../@types/plugin"
import { AnnictRESTAPI } from "./annictAPI"
import { SyobocalAPI } from "./syobocalAPI"
import { ARM, SayaDefinitionChannel } from "./types"

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export const detectProgramInfo = async ({
  rest,
  channel,
  program,
  arm,
  time,
}: {
  rest: AnnictRESTAPI
  channel: SayaDefinitionChannel
  program?: Program
  arm: ARM[]
  time: number
}): Promise<{
  annictId: number
  episode: {
    number: number
    title: string
    id?: number
  } | null
} | void> => {
  const now = dayjs()
  const targetDate =
    program && dayjs(program.startAt + program.duration).isBefore(now)
      ? dayjs(program.startAt + time + 1000)
      : now

  // しょぼいカレンダー
  if (channel.syobocalId) {
    const lookup = await SyobocalAPI.ProgLookup({
      ChID: channel.syobocalId.toString(),
      Range: targetDate.format("YYYYMMDD_HHmmss-YYYYMMDD_HHmmss"),
      JOIN: ["SubTitles"],
    })
    const syobocalProgram = lookup.pop()
    if (syobocalProgram) {
      /*const arm = await axios.get<{ annict_id?: number }>(
        "https://arm.kawaiioverflow.com/api/ids",
        {
          params: {
            service: "syobocal",
            id: syobocalProgram.TID,
          },
        }
      )*/
      const lookup = arm.find(
        (_arm) => _arm.syobocal_tid === syobocalProgram.TID
      )
      if (lookup?.annict_id) {
        return {
          annictId: lookup.annict_id,
          episode: {
            title: syobocalProgram.SubTitle,
            number: syobocalProgram.Count,
          },
        }
      }
    } else {
      console.warn("番組が見つかりませんでした")
    }
  }

  let startTime: dayjs.Dayjs
  let endTime: dayjs.Dayjs
  if (program?.startAt) {
    startTime = dayjs(program.startAt)
    endTime = dayjs(program.startAt + program.duration)
  } else {
    startTime = targetDate.clone()
    startTime.minute(startTime.minute() < 30 ? 0 : 30)
    endTime = startTime.clone().add(30, "minute")
  }

  // Annict
  if (channel.annictId) {
    const programs = await rest.getMyPrograms({
      filter_channel_ids: [channel.annictId],
      filter_started_at_gt: startTime.format("YYYY/MM/DD HH:mm"),
      filter_started_at_lt: endTime.format("YYYY/MM/DD HH:mm"),
      fields: [
        "work.id",
        "work.title",
        "work.no_episodes",
        "episode.id",
        "episode.title",
        "episode.number",
        "episode.number_text",
      ],
      sort_started_at: "asc",
      per_page: 1,
    })
    const program = programs.data.programs.splice(0).shift()
    if (program) {
      return {
        annictId: program.work.id,
        episode: program.episode,
      }
    }
  }
}

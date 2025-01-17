import axios from "axios"
import React, { useEffect, useState } from "react"
import { atom, useRecoilValue, useRecoilState } from "recoil"
import { InitPlugin } from "../@types/plugin"
import tailwind from "../tailwind.scss"
import { GyazoSetting } from "./types"

const _id = "io.github.ci7lus.miraktest-plugins.gyazo"
const prefix = "plugins.ci7lus.gyazo"
const meta = {
  id: _id,
  name: "Gyazo",
  author: "ci7lus",
  version: "0.0.1",
  description: "スクリーンショットをGyazoにアップロードするプラグイン",
}

const main: InitPlugin = {
  renderer: ({ atoms }) => {
    const settingAtom = atom<GyazoSetting>({
      key: `${prefix}.setting`,
      default: {},
    })
    const ssA = atom<string>({
      key: `${prefix}.objurl`,
      default: "",
    })

    return {
      ...meta,
      exposedAtoms: [],
      sharedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
        {
          type: "atom",
          atom: ssA,
        },
      ],
      storedAtoms: [
        {
          type: "atom",
          atom: settingAtom,
        },
      ],
      setup() {
        return
      },
      components: [
        {
          id: `${prefix}.uploader`,
          position: "onBackground",
          component: () => {
            const setting = useRecoilValue(settingAtom)
            const playingContent = useRecoilValue(
              atoms.contentPlayerPlayingContentAtom
            )
            const url = useRecoilValue(atoms.contentPlayerScreenshotUrlSelector)
            useEffect(() => {
              const token = setting.token
              if (!token || !url) {
                return
              }
              ;(async () => {
                const bin = await axios.get<ArrayBuffer>(url, {
                  responseType: "arraybuffer",
                })
                const form = new FormData()
                form.append("access_token", token)
                const title = playingContent?.program?.name
                if (title) {
                  form.append("desc", title)
                }
                const desc = playingContent?.service?.name
                if (desc) {
                  form.append("title", desc)
                }
                const blob = new Blob([bin.data], { type: "image/png" })
                form.append("imagedata", blob, url.split("/").pop())
                if (setting.collectionId) {
                  form.append("collection_id", setting.collectionId)
                }
                axios
                  .post("https://upload.gyazo.com/api/upload", form)
                  .catch((e) => console.error(e))
              })()
            }, [url])
            return <></>
          },
        },
        {
          id: `${prefix}.settings`,
          position: "onSetting",
          label: meta.name,
          component: () => {
            const [setting, setSetting] = useRecoilState(settingAtom)
            const [token, setToken] = useState(setting.token)
            const [collectionId, setCollectionId] = useState(
              setting.collectionId
            )
            return (
              <>
                <style>{tailwind}</style>
                <form
                  className="m-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSetting({
                      token: token || undefined,
                      collectionId: collectionId || undefined,
                    })
                  }}
                >
                  <label className="mb-2 block">
                    <span>Gyazo Access Token</span>
                    <input
                      type="text"
                      placeholder="****"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={token || ""}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </label>
                  <label className="mb-2 block">
                    <span>Collection Id</span>
                    <input
                      type="text"
                      placeholder="****"
                      className="block mt-2 form-input rounded-md w-full text-gray-900"
                      value={collectionId || ""}
                      onChange={(e) => setCollectionId(e.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer"
                  >
                    保存
                  </button>
                </form>
              </>
            )
          },
        },
      ],
      destroy() {
        return
      },
      windows: {},
    }
  },
}

export default main

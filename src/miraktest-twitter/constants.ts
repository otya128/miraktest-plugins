export const TWITTER_PLUGIN_ID = "io.github.ci7lus.miraktest-plugins.twitter"
export const TWITTER_PLUGIN_PREFIX = "plugins.ci7lus.twitter"
export const TWITTER_META = {
  id: TWITTER_PLUGIN_ID,
  name: "Twitter",
  author: "ci7lus",
  version: "0.0.9",
  description: "視聴中の番組に関連するツイートを投稿する",
}
export const TWITTER_TWEET_WINDOW_ID = `${TWITTER_PLUGIN_ID}.tweet`

export const TWITTER_MAPPING: { [key: string]: string } = {
  "NHK 総合": "nhk_gtv",
  Eテレ: "nhk_etv",
  NHKBS1: "nhk_bs1",
  NHKBSプレミアム: "nhk_bs_premium",
}

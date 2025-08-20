const presence = new Presence({
  clientId: '1324486726902616117',
})
const browsingTimestamp = Math.floor(Date.now() / 1000) // Show elapsed time

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Ia9Xgge.png', // Direct URL to the logo image
}

const slideshow = presence.createSlideshow()

presence.on('UpdateData', async () => {
  // Get the current URL
  const { pathname, href } = document.location

  // Create the base presence data
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo, // Direct URL to the logo image
    details: 'Boothを閲覧中',
    startTimestamp: browsingTimestamp, // Show elapsed time
  }

  // 検索したときの処理
  if (pathname.includes('/search/')) {
    // 検索したワードを取得する
    const search = document.querySelector<HTMLInputElement>('#js-item-search-box > div > form > div > input')
    const tags = document.querySelector<HTMLDivElement>(`[class="text-text-default inline-block"]`)
    const wordsToRemove = new Set(search?.value.split(' '))
    if (tags?.textContent) {
      const resultWords = tags.textContent.split(' ').filter(word => !wordsToRemove.has(word))
      const restag = resultWords?.join(' ')
      presenceData.details = (tags != null) ? `タグ: ${restag}` : `タグ: なし`
    }
    presenceData.name = (search?.value == null) ? `検索中` : `検索: ${search.value}`
    // ついでにブースのURLをボタンに登録する
    presenceData.buttons = [
      {
        label: '検索リンク表示',
        url: href,
      },
    ]
    presence.setActivity(presenceData)
  }
  // 商品を見ているときの処理
  else if (pathname.includes('/items/')) {
    // idを別で分けるために作った変数
    let num = 0
    // 商品の名前と画像を取得
    const item = document.querySelector<HTMLImageElement>('img.market-item-detail-item-image')
    const maker = document.querySelector<HTMLAnchorElement>(`[data-product-list="from market_show via market_item_detail to shop_index"]`)
    const imgmkr = document.querySelector<HTMLImageElement>(`[class="h-[24px] rounded-oval w-[24px]"]`)
    document.querySelectorAll<HTMLDivElement>('div.slick-thumbnail-border').forEach((items) => {
      if (items.querySelector<HTMLImageElement>('img')?.src != null) {
        slideshow.addSlide(`items${num}`, {

          details: `${maker?.textContent || '不明'}`,
          largeImageKey: items.querySelector<HTMLImageElement>('img')?.src,
          startTimestamp: browsingTimestamp,
        }, 500)
        num++
      }
    })
    // 取得して登録した画像や商品名をスライドショーで表示※ついでにボタンの処理も
    presence.setActivity(slideshow)
    const slides = slideshow.getSlides()
    for (const slide of slides) {
      const data = slide.data
      data.smallImageKey = imgmkr?.src
      data.buttons = [
        {
          label: '商品ページを表示',
          url: href,

        },
        {
          label: `ショップページを表示`,
          url: maker?.href || 'https://booth.pm',
        },
      ]
      data.name = `${item?.alt || '不明'}`
      slide.updateData(data)
    }
  }
  else if (pathname.includes('/items')) {
    presenceData.details = '商品を閲覧中'
  }
  else { // その他のページ処理
    presenceData.largeImageKey = ActivityAssets.Logo
    presence.setActivity(presenceData)
  }
})

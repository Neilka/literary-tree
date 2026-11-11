import type { Author } from '@/types'
import type { BranchMovement } from './branchMovements'
import type { EnrichedAuthor } from './types'

interface Inspiration {
  author: string
  illustrator: string
  gameDesigner: string
}

const pick = <T>(arr: T[], i: number): T => arr[i % arr.length]

// For writers: focus on craft, structure, voice
const authorTemplates = [
  (m: string, w: string, t: string) =>
    `作为${m}的代表，${t}是TA留给后来者最直接的技法遗产。写《${w}》时，TA没有把信息一次性倒给读者，而是让人物的行动和沉默自己说话——新人作者最该学的，是"相信读者能读懂"的克制。`,
  (m: string, w: string, t: string) =>
    `${m}写作者常常被模仿表面风格，却忽略TA真正的力量来源：对一个时代日常细节的耐心观察。写《${w}》时，TA用${t}把宏大命题塞进最小的生活切片里。这个思路比任何修辞都重要。`,
  (m: string, w: string, t: string) =>
    `从${m}的写作里，新人作者最该拿走的不是句式，而是"如何处理时间"。《${w}》证明：${t}可以让一段经历同时具有私人记忆和时代标本的重量。不要急着写"大事"，先学会让一个下午承载十年。`,
  (m: string, w: string, t: string) =>
    `${m}的核心遗产是"声音"——叙述者的腔调决定了整个世界的可信度。《${w}》里那种${t}的口吻，是TA花了很久才找到的。新人作者常犯的错是先想情节再找声音，应该反过来。`,
  (m: string, w: string, t: string) =>
    `学${m}不要只学华丽段落，要学TA如何"收"。《${w}》最动人的地方往往是没说出口的部分——${t}让留白有了重量。新人作者总怕读者不懂，其实好作家最怕说得太满。`,
]

// For illustrators: focus on visual atmosphere, character, composition
const illustratorTemplates = [
  (m: string, w: string, t: string) =>
    `${m}的世界之所以"看得见"，是因为TA给每个场景都留了气味和温度的位置。画《${w}》的插画，重点不是还原情节，而是抓住${t}带来的那种氛围——让观众一眼就知道"这故事发生在怎样的空气里"。`,
  (m: string, w: string, t: string) =>
    `画师可以从${m}这里学到"人物即世界观"。《${w}》里的角色造型不需要解释身份，TA的姿态、衣着、甚至站的位置就已经讲完了故事。${t}这种细节，比任何背景设定都更有叙事力。`,
  (m: string, w: string, t: string) =>
    `${m}擅长用对比制造视觉张力：宏大与琐碎、明亮与阴暗、静止与骚动在同一个画面里共存。画《${w}》时，试试用${t}做画面的锚点，让观众的视线有地方停留，再慢慢发现其余。`,
  (m: string, w: string, t: string) =>
    `从${m}的作品里，画师最该拿走的是"留白的叙事功能"。《${w}》里那些没画出来的部分——${t}——恰恰是最有想象力的地方。插画不是把文字翻译成图，是给文字留出呼吸的空间。`,
  (m: string, w: string, t: string) =>
    `${m}的色彩逻辑服务于情绪而非真实。画《${w}》时，不要纠结"那个时代真实的颜色是什么"，而要问"这个瞬间该是什么颜色"。${t}就是TA选择情绪色而非固有色的结果。`,
]

// For game designers: focus on systems, player agency, narrative structure
const gameDesignerTemplates = [
  (m: string, w: string, t: string) =>
    `${m}为游戏策划提供了"如何用系统讲故事"的范本。《${w}》里的${t}，本质是一套让角色被迫做出选择的规则。把它做成机制：不是让玩家"经历"故事，而是让玩家的选择生成故事。`,
  (m: string, w: string, t: string) =>
    `从${m}的叙事里，策划可以学到"信息释放节奏"。《${w}》没有一开始就把世界观倒给你，而是用${t}一点点勾着玩家往前走。游戏里最忌讳的就是开场 30 分钟的设定灌输——学学TA怎么藏。`,
  (m: string, w: string, t: string) =>
    `${m}的人物之所以让人难忘，是因为每个人都有自己的"规则"。设计《${w}》的角色系统时，把${t}做成角色的核心动机——玩家操作的不是一个数值容器，而是一个有行为逻辑的人。`,
  (m: string, w: string, t: string) =>
    `游戏策划可以从${m}这里学到"失败的叙事价值"。《${w}》里角色的${t}不是 bug，是设计——正因为有缺憾，玩家才会在意。好的游戏系统应该允许"不完美的通关"，而不是只有最优解。`,
  (m: string, w: string, t: string) =>
    `${m}的空间感值得策划研究：TA的故事总发生在一个有边界的世界里，但边界外的暗示让世界显得无限。设计《${w}》的关卡时，用${t}做"可见但不可达"的区域，比直接开放大地图更能激发探索欲。`,
]

export function generateInspiration(
  author: Author,
  mv: BranchMovement | undefined,
  enriched: Partial<EnrichedAuthor>,
): Inspiration {
  const name = author.name
  const traits = mv?.traits ?? ['叙事', '人物', '语言']
  const trait1 = pick(traits, name.length)
  const trait2 = pick(traits, name.length + 3)
  const works = enriched.works ?? author.works ?? []
  const firstWork = typeof works[0] === 'string' ? works[0] : (works[0] as any)?.title || '代表作'
  const movement = mv?.name || author.branch

  const seed = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)

  return {
    author: pick(authorTemplates, seed)(movement, firstWork, trait1),
    illustrator: pick(illustratorTemplates, seed + 1)(movement, firstWork, trait2),
    gameDesigner: pick(gameDesignerTemplates, seed + 2)(movement, firstWork, trait1),
  }
}

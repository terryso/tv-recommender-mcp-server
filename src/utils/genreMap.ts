/**
 * 类型映射工具
 * 将用户输入的中英文类型名映射到TMDb的类型ID
 */

// TMDb电视节目类型映射
export interface GenreMap {
  id: number;        // TMDb类型ID
  englishName: string; // 英文类型名
  chineseName: string;  // 中文类型名
}

// TMDb 支持的主要电视剧类型
// 完整列表参考: https://developers.themoviedb.org/3/genres/get-tv-list
export const genreList: GenreMap[] = [
  { id: 10759, englishName: "Action & Adventure", chineseName: "动作冒险" },
  { id: 16, englishName: "Animation", chineseName: "动画" },
  { id: 35, englishName: "Comedy", chineseName: "喜剧" },
  { id: 80, englishName: "Crime", chineseName: "犯罪" },
  { id: 99, englishName: "Documentary", chineseName: "纪录" },
  { id: 18, englishName: "Drama", chineseName: "剧情" },
  { id: 10751, englishName: "Family", chineseName: "家庭" },
  { id: 10762, englishName: "Kids", chineseName: "儿童" },
  { id: 9648, englishName: "Mystery", chineseName: "悬疑" },
  { id: 10763, englishName: "News", chineseName: "新闻" },
  { id: 10764, englishName: "Reality", chineseName: "真人秀" },
  { id: 10765, englishName: "Sci-Fi & Fantasy", chineseName: "科幻奇幻" },
  { id: 10766, englishName: "Soap", chineseName: "肥皂剧" },
  { id: 10767, englishName: "Talk", chineseName: "脱口秀" },
  { id: 10768, englishName: "War & Politics", chineseName: "战争政治" },
  { id: 37, englishName: "Western", chineseName: "西部" }
];

// 常见的别名和更多中文表达方式
const genreAliases: Record<string, number> = {
  // 英文别名
  "action": 10759,
  "adventure": 10759,
  "cartoon": 16,
  "funny": 35,
  "detective story": 80,
  "crime story": 80,
  "docs": 99,
  "doc": 99,
  "family show": 10751,
  "children": 10762,
  "mystery": 9648,
  "detective": 9648,
  "news show": 10763,
  "science fiction": 10765,
  "fantasy": 10765,
  "scifi": 10765,
  "sci-fi": 10765,
  "talk show": 10767,
  "politics": 10768,
  "war": 10768,
  
  // 中文别名
  "动作": 10759,
  "冒险": 10759,
  "卡通": 16,
  "搞笑": 35,
  "幽默": 35,
  "侦探": 80,
  "罪案": 80,
  "纪实": 99,
  "纪录片": 99,
  "温情": 18,
  "家庭剧": 10751,
  "少儿": 10762,
  "推理": 9648,
  "新闻节目": 10763,
  "综艺": 10764,
  "科幻": 10765,
  "奇幻": 10765,
  "魔幻": 10765,
  "脱口秀节目": 10767,
  "访谈": 10767,
  "战争": 10768,
  "政治": 10768
};

/**
 * 将用户输入的类型名（中文或英文）映射到TMDb类型ID
 * @param genreName 用户输入的类型名
 * @returns TMDb类型ID，如果找不到映射则返回undefined
 */
export function mapGenreToId(genreName: string): number | undefined {
  if (!genreName) return undefined;
  
  // 统一处理：转小写并去除首尾空格
  const normalizedName = genreName.toLowerCase().trim();
  
  // 1. 先检查别名映射
  if (normalizedName in genreAliases) {
    return genreAliases[normalizedName];
  }
  
  // 2. 再检查主要类型列表
  // 先精确匹配
  const exactMatch = genreList.find(
    genre => 
      genre.englishName.toLowerCase() === normalizedName || 
      genre.chineseName === normalizedName
  );
  
  if (exactMatch) return exactMatch.id;
  
  // 3. 最后进行模糊匹配（包含关系）
  const fuzzyMatch = genreList.find(
    genre => 
      genre.englishName.toLowerCase().includes(normalizedName) || 
      normalizedName.includes(genre.englishName.toLowerCase()) ||
      genre.chineseName.includes(normalizedName) || 
      normalizedName.includes(genre.chineseName)
  );
  
  return fuzzyMatch?.id;
}

/**
 * 获取类型ID对应的类型名（优先返回中文名）
 * @param genreId TMDb类型ID
 * @returns 类型名（中文）
 */
export function getGenreNameById(genreId: number): string | undefined {
  const genre = genreList.find(g => g.id === genreId);
  return genre?.chineseName;
} 
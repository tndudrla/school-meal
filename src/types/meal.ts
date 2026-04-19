export interface Meal {
  date: string;          // YYYYMMDD
  mealType: string;      // 중식, 석식 등
  dishes: Dish[];
  calories: string;      // "653.6 Kcal"
  nutrients?: string;
}

export interface Dish {
  name: string;
  allergies: string[];   // ["1", "2", "5"] 같은 알레르기 번호
}

export interface School {
  atptCode: string;      // J10 (경기도교육청)
  schoolCode: string;    // SD_SCHUL_CODE
  name: string;
  address?: string;
}

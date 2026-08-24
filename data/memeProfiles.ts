import type { MemeProfile } from "../types/security.ts";

export const memeProfiles: Record<string, MemeProfile> = {
  aapl: {
    id: "aapl",
    ticker: "AAPL",
    figure: "팀 쿡",
    concentrationTitles: {
      high: ["팀 쿡의 먼 친척", "애플 생태계 명예 주민"],
      extreme: ["아이폰보다 애플 비중이 더 큽니다"],
    },
  },
  nvda: {
    id: "nvda",
    ticker: "NVDA",
    figure: "젠슨 황",
    concentrationTitles: {
      high: ["젠슨 황의 가죽재킷 수제자", "GPU 신앙 고백"],
      extreme: ["AI가 쉬면 계좌도 쉽니다"],
    },
  },
  tsla: {
    id: "tsla",
    ticker: "TSLA",
    figure: "일론 머스크",
    concentrationTitles: {
      high: ["머스크와 운명공동체"],
      extreme: ["CEO의 트윗이 내 자산가격입니다"],
    },
  },
  "brk.b": {
    id: "brk.b",
    ticker: "BRK.B",
    figure: "워런 버핏",
    concentrationTitles: {
      high: ["버핏의 애제자"],
      extreme: ["오마하 주주총회 지정석"],
    },
  },
  pltr: {
    id: "pltr",
    ticker: "PLTR",
    figure: "알렉스 카프",
    concentrationTitles: {
      high: ["알렉스 카프의 비밀요원"],
      extreme: ["팔란티어 IR보다 미래를 믿습니다"],
    },
  },
  abcl: {
    id: "abcl",
    ticker: "ABCL",
    figure: "칼 한센",
    concentrationTitles: {
      high: ["칼 한센의 아들", "AbCellera 명예 연구원"],
      extreme: ["칼 한센보다 ABCL 비중이 높습니다", "사실상 AbCellera와 운명공동체"],
    },
  },
  "005930": {
    id: "005930",
    ticker: "005930",
    figure: "삼성전자",
    concentrationTitles: {
      high: ["삼성전자 명예 임원"],
      extreme: ["반도체 사이클이 가족 행사입니다"],
    },
  },
  "000660": {
    id: "000660",
    ticker: "000660",
    figure: "SK하이닉스",
    concentrationTitles: {
      high: ["HBM 신봉자"],
      extreme: ["메모리 가격표가 심박수입니다"],
    },
  },
};

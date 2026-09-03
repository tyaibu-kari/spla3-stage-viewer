"use strict";
/* 自動生成: ユーザーがアップロードした「スプラトゥーン3ブキリスト.xlsx」から生成。
   このファイルはClaudeが生成しました。ブキ/スペシャルのデータを更新したい場合は、
   新しいExcelファイルを渡して再生成を依頼してください。 */
const WEAPON_DATA = [
 {
  "category": "シューター",
  "name": "ボールドマーカー",
  "sub": "カーリングボム",
  "special": "ウルトラハンコ",
  "range": 1.7,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ボールドマーカーネオ",
  "sub": "ジャンプビーコン",
  "special": "メガホンレーザー5.1ch",
  "range": 1.7,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "わかばシューター",
  "sub": "スプラッシュボム",
  "special": "グレートバリア",
  "range": 2.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "もみじシューター",
  "sub": "トーピード",
  "special": "ホップソナー",
  "range": 2.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "シャープマーカー",
  "sub": "クイックボム",
  "special": "カニタンク",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "シャープマーカーネオ",
  "sub": "キューバンボム",
  "special": "トリプルトルネード",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "シャープマーカーGECK",
  "sub": "ポイズンミスト",
  "special": "アメフラシ",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "スプラシューター",
  "sub": "キューバンボム",
  "special": "ウルトラショット",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "スプラシューターコラボ",
  "sub": "スプラッシュボム",
  "special": "トリプルトルネード",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "スプラシューター煌",
  "sub": "クイックボム",
  "special": "テイオウイカ",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ヒーローシューター レプリカ",
  "sub": "キューバンボム",
  "special": "ウルトラショット",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プロモデラーMG",
  "sub": "タンサンボム",
  "special": "サメライド",
  "range": 2.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プロモデラーRG",
  "sub": "スプリンクラー",
  "special": "ナイスダマ",
  "range": 2.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プロモデラー彩",
  "sub": "クイックボム",
  "special": "スミナガシート",
  "range": 2.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": ".52ガロン",
  "sub": "スプラッシュシールド",
  "special": "メガホンレーザー5.1ch",
  "range": 2.7,
  "range2": null
 },
 {
  "category": "シューター",
  "name": ".52ガロンデコ",
  "sub": "カーリングボム",
  "special": "スミナガシート",
  "range": 2.7,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "N-ZAP85",
  "sub": "キューバンボム",
  "special": "エナジースタンド",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "N-ZAP89",
  "sub": "ロボットボム",
  "special": "デコイチラシ",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プライムシューター",
  "sub": "ラインマーカー",
  "special": "カニタンク",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プライムシューターコラボ",
  "sub": "キューバンボム",
  "special": "ナイスダマ",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "プライムシューターFRZN",
  "sub": "スプラッシュボム",
  "special": "マルチミサイル",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": ".96ガロン",
  "sub": "スプリンクラー",
  "special": "キューインキ",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": ".96ガロンデコ",
  "sub": "スプラッシュシールド",
  "special": "テイオウイカ",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": ".96ガロン爪",
  "sub": "ラインマーカー",
  "special": "エナジースタンド",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ジェットスイーパー",
  "sub": "ラインマーカー",
  "special": "キューインキ",
  "range": 4.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ジェットスイーパーカスタム",
  "sub": "ポイズンミスト",
  "special": "アメフラシ",
  "range": 4.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ジェットスイーパーCOBR",
  "sub": "クイックボム",
  "special": "ウルトラチャクチ",
  "range": 4.6,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "スペースシューター",
  "sub": "ポイントセンサー",
  "special": "メガホンレーザー5.1ch",
  "range": 3.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "スペースシューターコラボ",
  "sub": "トラップ",
  "special": "ジェットパック",
  "range": 3.3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "L3リールガン",
  "sub": "カーリングボム",
  "special": "カニタンク",
  "range": 3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "L3リールガンD",
  "sub": "クイックボム",
  "special": "ウルトラハンコ",
  "range": 3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "L3リールガン箔",
  "sub": "スプラッシュボム",
  "special": "ジェットパック",
  "range": 3,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "H3リールガン",
  "sub": "ポイズンミスト",
  "special": "エナジースタンド",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "H3リールガンD",
  "sub": "スプラッシュシールド",
  "special": "グレートバリア",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "H3リールガンSNAK",
  "sub": "キューバンボム",
  "special": "トリプルトルネード",
  "range": 3.5,
  "range2": null
 },
 {
  "category": "シューター",
  "name": "ボトルガイザー",
  "sub": "スプラッシュシールド",
  "special": "ウルトラショット",
  "range": 3.8,
  "range2": 2.5
 },
 {
  "category": "シューター",
  "name": "ボトルガイザーフォイル",
  "sub": "ロボットボム",
  "special": "スミナガシート",
  "range": 3.8,
  "range2": 2.5
 },
 {
  "category": "ブラスター",
  "name": "ノヴァブラスター",
  "sub": "スプラッシュボム",
  "special": "ショクワンダー",
  "range": 1.6,
  "range2": 2.3
 },
 {
  "category": "ブラスター",
  "name": "ノヴァブラスターネオ",
  "sub": "トラップ",
  "special": "ウルトラハンコ",
  "range": 1.6,
  "range2": 2.3
 },
 {
  "category": "ブラスター",
  "name": "ホットブラスター",
  "sub": "ロボットボム",
  "special": "グレートバリア",
  "range": 2.1,
  "range2": 2.7
 },
 {
  "category": "ブラスター",
  "name": "ホットブラスターカスタム",
  "sub": "ポイントセンサー",
  "special": "ウルトラショット",
  "range": 2.1,
  "range2": 2.7
 },
 {
  "category": "ブラスター",
  "name": "ホットブラスター艶",
  "sub": "ジャンプビーコン",
  "special": "カニタンク",
  "range": 2.1,
  "range2": 2.7
 },
 {
  "category": "ブラスター",
  "name": "ロングブラスター",
  "sub": "キューバンボム",
  "special": "ホップソナー",
  "range": 2.8,
  "range2": 3.4
 },
 {
  "category": "ブラスター",
  "name": "ロングブラスターカスタム",
  "sub": "スプラッシュボム",
  "special": "テイオウイカ",
  "range": 2.8,
  "range2": 3.4
 },
 {
  "category": "ブラスター",
  "name": "クラッシュブラスター",
  "sub": "スプラッシュボム",
  "special": "ウルトラショット",
  "range": 1.9,
  "range2": 2.7
 },
 {
  "category": "ブラスター",
  "name": "クラッシュブラスターネオ",
  "sub": "カーリングボム",
  "special": "デコイチラシ",
  "range": 1.9,
  "range2": 2.7
 },
 {
  "category": "ブラスター",
  "name": "ラピッドブラスター",
  "sub": "トラップ",
  "special": "トリプルトルネード",
  "range": 3.1,
  "range2": 4.2
 },
 {
  "category": "ブラスター",
  "name": "ラピッドブラスターデコ",
  "sub": "トーピード",
  "special": "ジェットパック",
  "range": 3.1,
  "range2": 4.2
 },
 {
  "category": "ブラスター",
  "name": "Rブラスターエリート",
  "sub": "ポイズンミスト",
  "special": "アメフラシ",
  "range": 3.6,
  "range2": 4.2
 },
 {
  "category": "ブラスター",
  "name": "Rブラスターエリートデコ",
  "sub": "ラインマーカー",
  "special": "メガホンレーザー5.1ch",
  "range": 3.6,
  "range2": 4.2
 },
 {
  "category": "ブラスター",
  "name": "RブラスターエリートWNTR",
  "sub": "キューバンボム",
  "special": "エナジースタンド",
  "range": 3.6,
  "range2": 4.2
 },
 {
  "category": "ブラスター",
  "name": "S-BLAST92",
  "sub": "スプリンクラー",
  "special": "サメライド",
  "range": 3,
  "range2": 3.3
 },
 {
  "category": "ブラスター",
  "name": "S-BLAST91",
  "sub": "クイックボム",
  "special": "ナイスダマ",
  "range": 3,
  "range2": 3.3
 },
 {
  "category": "ローラー",
  "name": "カーボンローラー",
  "sub": "ロボットボム",
  "special": "ショクワンダー",
  "range": 1.6,
  "range2": 2.7
 },
 {
  "category": "ローラー",
  "name": "カーボンローラーデコ",
  "sub": "クイックボム",
  "special": "ウルトラショット",
  "range": 1.6,
  "range2": 2.7
 },
 {
  "category": "ローラー",
  "name": "カーボンローラーANGL",
  "sub": "タンサンボム",
  "special": "デコイチラシ",
  "range": 1.6,
  "range2": 2.7
 },
 {
  "category": "ローラー",
  "name": "スプラローラー",
  "sub": "カーリングボム",
  "special": "グレートバリア",
  "range": 2.4,
  "range2": 3.2
 },
 {
  "category": "ローラー",
  "name": "スプラローラーコラボ",
  "sub": "ジャンプビーコン",
  "special": "テイオウイカ",
  "range": 2.4,
  "range2": 3.2
 },
 {
  "category": "ローラー",
  "name": "ダイナモローラー",
  "sub": "スプリンクラー",
  "special": "エナジースタンド",
  "range": 3.6,
  "range2": 4.8
 },
 {
  "category": "ローラー",
  "name": "ダイナモローラーテスラ",
  "sub": "スプラッシュボム",
  "special": "デコイチラシ",
  "range": 3.6,
  "range2": 4.8
 },
 {
  "category": "ローラー",
  "name": "ダイナモローラー冥",
  "sub": "ポイントセンサー",
  "special": "メガホンレーザー5.1ch",
  "range": 3.6,
  "range2": 4.8
 },
 {
  "category": "ローラー",
  "name": "ヴァリアブルローラー",
  "sub": "トラップ",
  "special": "マルチミサイル",
  "range": 2,
  "range2": 4.1
 },
 {
  "category": "ローラー",
  "name": "ヴァリアブルローラーフォイル",
  "sub": "キューバンボム",
  "special": "スミナガシート",
  "range": 2,
  "range2": 4.1
 },
 {
  "category": "ローラー",
  "name": "ワイドローラー",
  "sub": "スプラッシュシールド",
  "special": "キューインキ",
  "range": 2.4,
  "range2": 3.9
 },
 {
  "category": "ローラー",
  "name": "ワイドローラーコラボ",
  "sub": "ラインマーカー",
  "special": "アメフラシ",
  "range": 2.4,
  "range2": 3.9
 },
 {
  "category": "ローラー",
  "name": "ワイドローラー惑",
  "sub": "トーピード",
  "special": "ウルトラチャクチ",
  "range": 2.4,
  "range2": 3.9
 },
 {
  "category": "フデ",
  "name": "パブロ",
  "sub": "スプラッシュボム",
  "special": "メガホンレーザー5.1ch",
  "range": 1.5,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "パブロ・ヒュー",
  "sub": "トラップ",
  "special": "ウルトラハンコ",
  "range": 1.5,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "ホクサイ",
  "sub": "キューバンボム",
  "special": "ショクワンダー",
  "range": 1.9,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "ホクサイ・ヒュー",
  "sub": "ジャンプビーコン",
  "special": "アメフラシ",
  "range": 1.9,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "ホクサイ彗",
  "sub": "ロボットボム",
  "special": "テイオウイカ",
  "range": 1.9,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "フィンセント",
  "sub": "カーリングボム",
  "special": "ホップソナー",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "フィンセント・ヒュー",
  "sub": "ポイントセンサー",
  "special": "マルチミサイル",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "フデ",
  "name": "フィンセントBRNZ",
  "sub": "スプラッシュシールド",
  "special": "ウルトラショット",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "チャージャー",
  "name": "スクイックリンα",
  "sub": "ポイントセンサー",
  "special": "グレートバリア",
  "range": 3.8,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スクイックリンβ",
  "sub": "ロボットボム",
  "special": "ウルトラチャクチ",
  "range": 3.8,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラチャージャー",
  "sub": "スプラッシュボム",
  "special": "キューインキ",
  "range": 5.2,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラチャージャーコラボ",
  "sub": "スプラッシュシールド",
  "special": "トリプルトルネード",
  "range": 5.2,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラチャージャーFRST",
  "sub": "スプリンクラー",
  "special": "カニタンク",
  "range": 5.2,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラスコープ",
  "sub": "スプラッシュボム",
  "special": "キューインキ",
  "range": 5.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラスコープコラボ",
  "sub": "スプラッシュシールド",
  "special": "トリプルトルネード",
  "range": 5.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "スプラチャージャースコープFRST",
  "sub": "スプリンクラー",
  "special": "カニタンク",
  "range": 5.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "リッター4K",
  "sub": "トラップ",
  "special": "ホップソナー",
  "range": 6.2,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "リッター4Kカスタム",
  "sub": "ジャンプビーコン",
  "special": "テイオウイカ",
  "range": 6.2,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "4Kスコープ",
  "sub": "トラップ",
  "special": "ホップソナー",
  "range": 6.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "4Kスコープカスタム",
  "sub": "ジャンプビーコン",
  "special": "テイオウイカ",
  "range": 6.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "14式竹筒銃・甲",
  "sub": "ロボットボム",
  "special": "メガホンレーザー5.1ch",
  "range": 4.3,
  "range2": null
 },
 {
  "category": "チャージャー",
  "name": "14式竹筒銃・乙",
  "sub": "ポイズンミスト",
  "special": "デコイチラシ",
  "range": 4.3,
  "range2": null
 },
 {
  "category": "チャージャー",
  "name": "ソイチューバー",
  "sub": "トーピード",
  "special": "マルチミサイル",
  "range": 4.35,
  "range2": 2.9
 },
 {
  "category": "チャージャー",
  "name": "ソイチューバーカスタム",
  "sub": "タンサンボム",
  "special": "ウルトラハンコ",
  "range": 4.35,
  "range2": 2.9
 },
 {
  "category": "チャージャー",
  "name": "R-PEN/5H",
  "sub": "スプリンクラー",
  "special": "エナジースタンド",
  "range": 5.7,
  "range2": 2.3
 },
 {
  "category": "チャージャー",
  "name": "R-PEN/5B",
  "sub": "スプラッシュシールド",
  "special": "アメフラシ",
  "range": 5.7,
  "range2": 2.3
 },
 {
  "category": "スロッシャー",
  "name": "バケットスロッシャー",
  "sub": "スプラッシュボム",
  "special": "トリプルトルネード",
  "range": 3.1,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "バケットスロッシャーデコ",
  "sub": "ラインマーカー",
  "special": "ショクワンダー",
  "range": 3.1,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "ヒッセン",
  "sub": "ポイズンミスト",
  "special": "ジェットパック",
  "range": 2.4,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "ヒッセン・ヒュー",
  "sub": "タンサンボム",
  "special": "ウルトラハンコ",
  "range": 2.4,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "ヒッセンASH",
  "sub": "スプラッシュボム",
  "special": "トリプルトルネード",
  "range": 2.4,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "スクリュースロッシャー",
  "sub": "タンサンボム",
  "special": "ナイスダマ",
  "range": 3,
  "range2": 3.3
 },
 {
  "category": "スロッシャー",
  "name": "スクリュースロッシャーネオ",
  "sub": "ポイントセンサー",
  "special": "ウルトラショット",
  "range": 3,
  "range2": 3.3
 },
 {
  "category": "スロッシャー",
  "name": "オーバーフロッシャー",
  "sub": "スプリンクラー",
  "special": "アメフラシ",
  "range": 5.4,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "オーバーフロッシャーデコ",
  "sub": "ラインマーカー",
  "special": "テイオウイカ",
  "range": 5.4,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "エクスプロッシャー",
  "sub": "ポイントセンサー",
  "special": "ウルトラハンコ",
  "range": 4.2,
  "range2": 4.7
 },
 {
  "category": "スロッシャー",
  "name": "エクスプロッシャーカスタム",
  "sub": "スプラッシュシールド",
  "special": "ウルトラチャクチ",
  "range": 4.2,
  "range2": 4.7
 },
 {
  "category": "スロッシャー",
  "name": "モップリン",
  "sub": "キューバンボム",
  "special": "サメライド",
  "range": 3.3,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "モップリンD",
  "sub": "ジャンプビーコン",
  "special": "ホップソナー",
  "range": 3.3,
  "range2": null
 },
 {
  "category": "スロッシャー",
  "name": "モップリン角",
  "sub": "カーリングボム",
  "special": "カニタンク",
  "range": 3.3,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "スプラスピナー",
  "sub": "クイックボム",
  "special": "ウルトラハンコ",
  "range": 3,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "スプラスピナーコラボ",
  "sub": "ポイズンミスト",
  "special": "グレートバリア",
  "range": 3,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "スプラスピナーPYTN",
  "sub": "ジャンプビーコン",
  "special": "ウルトラショット",
  "range": 3,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "バレルスピナー",
  "sub": "スプリンクラー",
  "special": "ホップソナー",
  "range": 4.2,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "バレルスピナーデコ",
  "sub": "ポイントセンサー",
  "special": "テイオウイカ",
  "range": 4.2,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "ハイドラント",
  "sub": "ロボットボム",
  "special": "ナイスダマ",
  "range": 5,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "ハイドラントカスタム",
  "sub": "トラップ",
  "special": "ウルトラチャクチ",
  "range": 5,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "ハイドラント圧",
  "sub": "スプリンクラー",
  "special": "グレートバリア",
  "range": 5,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "ノーチラス47",
  "sub": "ポイントセンサー",
  "special": "アメフラシ",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "ノーチラス79",
  "sub": "キューバンボム",
  "special": "ウルトラチャクチ",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "スピナー",
  "name": "クーゲルシュライバー",
  "sub": "タンサンボム",
  "special": "ジェットパック",
  "range": 2.3,
  "range2": 4.7
 },
 {
  "category": "スピナー",
  "name": "クーゲルシュライバーヒュー",
  "sub": "トラップ",
  "special": "テイオウイカ",
  "range": 2.3,
  "range2": 4.7
 },
 {
  "category": "スピナー",
  "name": "イグザミナー",
  "sub": "カーリングボム",
  "special": "エナジースタンド",
  "range": 3.5,
  "range2": 3.5
 },
 {
  "category": "スピナー",
  "name": "イグザミナー・ヒュー",
  "sub": "スプラッシュボム",
  "special": "カニタンク",
  "range": 3.5,
  "range2": 3.5
 },
 {
  "category": "マニューバー",
  "name": "スパッタリー",
  "sub": "ジャンプビーコン",
  "special": "エナジースタンド",
  "range": 2,
  "range2": 2
 },
 {
  "category": "マニューバー",
  "name": "スパッタリーヒュー",
  "sub": "トーピード",
  "special": "サメライド",
  "range": 2,
  "range2": 2
 },
 {
  "category": "マニューバー",
  "name": "スパッタリーOWL",
  "sub": "スプラッシュボム",
  "special": "メガホンレーザー5.1ch",
  "range": 2,
  "range2": 2
 },
 {
  "category": "マニューバー",
  "name": "スプラマニューバー",
  "sub": "キューバンボム",
  "special": "カニタンク",
  "range": 2.5,
  "range2": 2.5
 },
 {
  "category": "マニューバー",
  "name": "スプラマニューバーコラボ",
  "sub": "カーリングボム",
  "special": "ウルトラチャクチ",
  "range": 2.5,
  "range2": 2.5
 },
 {
  "category": "マニューバー",
  "name": "スプラマニューバー耀",
  "sub": "タンサンボム",
  "special": "グレートバリア",
  "range": 2.5,
  "range2": 2.5
 },
 {
  "category": "マニューバー",
  "name": "デュアルスイーパー",
  "sub": "スプラッシュボム",
  "special": "ホップソナー",
  "range": 3.4,
  "range2": null
 },
 {
  "category": "マニューバー",
  "name": "デュアルスイーパーカスタム",
  "sub": "ジャンプビーコン",
  "special": "デコイチラシ",
  "range": 3.4,
  "range2": null
 },
 {
  "category": "マニューバー",
  "name": "デュアルスイーパー蹄",
  "sub": "ポイントセンサー",
  "special": "スミナガシート",
  "range": 3.4,
  "range2": null
 },
 {
  "category": "マニューバー",
  "name": "ケルビン525",
  "sub": "シールド",
  "special": "ナイスダマ",
  "range": 3,
  "range2": 3.4
 },
 {
  "category": "マニューバー",
  "name": "ケルビン525デコ",
  "sub": "ポイントセンサー",
  "special": "ウルトラショット",
  "range": 3,
  "range2": 3.4
 },
 {
  "category": "マニューバー",
  "name": "クアッドホッパーブラック",
  "sub": "ロボットボム",
  "special": "サメライド",
  "range": 2.8,
  "range2": 2.8
 },
 {
  "category": "マニューバー",
  "name": "クアッドホッパーホワイト",
  "sub": "スプリンクラー",
  "special": "ショクワンダー",
  "range": 2.8,
  "range2": 2.8
 },
 {
  "category": "マニューバー",
  "name": "ガエンFF",
  "sub": "トラップ",
  "special": "メガホンレーザー5.1ch",
  "range": 4.1,
  "range2": 3
 },
 {
  "category": "マニューバー",
  "name": "ガエンFFカスタム",
  "sub": "クイックボム",
  "special": "トリプルトルネード",
  "range": 4.1,
  "range2": 3
 },
 {
  "category": "シェルター",
  "name": "パラシェルター",
  "sub": "スプリンクラー",
  "special": "トリプルトルネード",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "パラシェルターソレーラ",
  "sub": "ロボットボム",
  "special": "ジェットパック",
  "range": 2.5,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "キャンピングシェルター",
  "sub": "ジャンプビーコン",
  "special": "キューインキ",
  "range": 3.1,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "キャンピングシェルターソレーラ",
  "sub": "トラップ",
  "special": "ウルトラショット",
  "range": 3.1,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "キャンピングシェルターCREM",
  "sub": "ポイズンミスト",
  "special": "デコイチラシ",
  "range": 3.1,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "スパイガジェット",
  "sub": "トラップ",
  "special": "サメライド",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "スパイガジェットソレーラ",
  "sub": "トーピード",
  "special": "スミナガシート",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "スパイガジェット繚",
  "sub": "カーリングボム",
  "special": "メガホンレーザー5.1ch",
  "range": 2.6,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "24式張替傘・甲",
  "sub": "ラインマーカー",
  "special": "グレートバリア",
  "range": 3,
  "range2": null
 },
 {
  "category": "シェルター",
  "name": "24式張替傘・乙",
  "sub": "ポイズンミスト",
  "special": "アメフラシ",
  "range": 3,
  "range2": null
 },
 {
  "category": "ストリンガー",
  "name": "トライストリンガー",
  "sub": "ポイズンミスト",
  "special": "メガホンレーザー5.1ch",
  "range": 5.4,
  "range2": 5.8
 },
 {
  "category": "ストリンガー",
  "name": "トライストリンガーコラボ",
  "sub": "スプリンクラー",
  "special": "デコイチラシ",
  "range": 5.4,
  "range2": 5.8
 },
 {
  "category": "ストリンガー",
  "name": "トライストリンガー燈",
  "sub": "ラインマーカー",
  "special": "ジェットパック",
  "range": 5.4,
  "range2": 5.8
 },
 {
  "category": "ストリンガー",
  "name": "LACT-450",
  "sub": "カーリングボム",
  "special": "マルチミサイル",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "ストリンガー",
  "name": "LACT-450デコ",
  "sub": "スプラッシュシールド",
  "special": "サメライド",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "ストリンガー",
  "name": "LACT-450MILK",
  "sub": "トーピード",
  "special": "ナイスダマ",
  "range": 3.6,
  "range2": null
 },
 {
  "category": "ストリンガー",
  "name": "フルイドV",
  "sub": "ロボットボム",
  "special": "ホップソナー",
  "range": 4.9,
  "range2": 5.3
 },
 {
  "category": "ストリンガー",
  "name": "フルイドVカスタム",
  "sub": "ポイントセンサー",
  "special": "ウルトラハンコ",
  "range": 4.9,
  "range2": 5.3
 },
 {
  "category": "ワイパー",
  "name": "ドライブワイパー",
  "sub": "トーピード",
  "special": "ウルトラハンコ",
  "range": 3,
  "range2": 3.7
 },
 {
  "category": "ワイパー",
  "name": "ドライブワイパーデコ",
  "sub": "ジャンプビーコン",
  "special": "マルチミサイル",
  "range": 3,
  "range2": 3.7
 },
 {
  "category": "ワイパー",
  "name": "ドライブワイパーRUST",
  "sub": "カーリングボム",
  "special": "ウルトラショット",
  "range": 3,
  "range2": 3.7
 },
 {
  "category": "ワイパー",
  "name": "ジムワイパー",
  "sub": "クイックボム",
  "special": "ショクワンダー",
  "range": 3.8,
  "range2": 4.5
 },
 {
  "category": "ワイパー",
  "name": "ジムワイパーヒュー",
  "sub": "ポイズンミスト",
  "special": "カニタンク",
  "range": 3.8,
  "range2": 4.5
 },
 {
  "category": "ワイパー",
  "name": "ジムワイパー封",
  "sub": "ロボットボム",
  "special": "ナイスダマ",
  "range": 3.8,
  "range2": 4.5
 },
 {
  "category": "ワイパー",
  "name": "デンタルワイパーミント",
  "sub": "キューバンボム",
  "special": "グレートバリア",
  "range": 3.1,
  "range2": 3.3
 },
 {
  "category": "ワイパー",
  "name": "デンタルワイパースミ",
  "sub": "スプラッシュシールド",
  "special": "ジェットパック",
  "range": 3.1,
  "range2": 3.3
 }
];
const SPECIAL_RANGE_DATA = {
 "ウルトラハンコ": {
  "range1": 5.5,
  "range2": 6.2,
  "blastRange": 7.1
 },
 "メガホンレーザー5.1ch": {
  "range1": null,
  "range2": null,
  "blastRange": null
 },
 "グレートバリア": {
  "range1": 1.5,
  "range2": 0.45,
  "blastRange": null
 },
 "ホップソナー": {
  "range1": 4,
  "range2": null,
  "blastRange": 2.5
 },
 "カニタンク": {
  "range1": 5.7,
  "range2": 5.6,
  "blastRange": 6.6
 },
 "トリプルトルネード": {
  "range1": 6.2,
  "range2": null,
  "blastRange": 1.54
 },
 "アメフラシ": {
  "range1": 7,
  "range2": null,
  "blastRange": 2
 },
 "ウルトラショット": {
  "range1": 5.8,
  "range2": null,
  "blastRange": 6.5
 },
 "テイオウイカ": {
  "range1": 0.6,
  "range2": 2.5,
  "blastRange": null
 },
 "サメライド": {
  "range1": 5,
  "range2": 1.8,
  "blastRange": 2.98
 },
 "ナイスダマ": {
  "range1": null,
  "range2": null,
  "blastRange": 2.5
 },
 "スミナガシート": {
  "range1": 4,
  "range2": null,
  "blastRange": null
 },
 "エナジースタンド": {
  "range1": null,
  "range2": null,
  "blastRange": 1.4
 },
 "デコイチラシ": {
  "range1": 3.5,
  "range2": null,
  "blastRange": 1.2
 },
 "マルチミサイル": {
  "range1": 0.22,
  "range2": 0.42,
  "blastRange": 0.88
 },
 "キューインキ": {
  "range1": 3.6,
  "range2": 1.2,
  "blastRange": 2
 },
 "ウルトラチャクチ": {
  "range1": 1.28,
  "range2": 1.92,
  "blastRange": 3.4
 },
 "ジェットパック": {
  "range1": 6,
  "range2": 0.51,
  "blastRange": 1
 },
 "ショクワンダー": {
  "range1": 7,
  "range2": 1.05,
  "blastRange": 1.2
 }
};

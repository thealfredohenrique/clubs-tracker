# 🎮 Clubs API Documentation

API para consultar informações de Clubes Pro no EA Sports FC.

## Base URL

```
https://proclubs.ea.com/api/fc
```

---

## 📋 Endpoints

### 1. All Time Leaderboard Search By Club Name

Busca clubes pelo nome no ranking de todos os tempos (all-time).

**Endpoint:** `GET /allTimeLeaderboard/search`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo           |
|------------|--------|-------------|------------------------------------|-------------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5`     |
| `clubName` | string | Sim         | Nome do clube a ser pesquisado     | `Fera Enjaulada`  |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /allTimeLeaderboard/search?platform=common-gen5&clubName=Fera%20Enjaulada
Content-Type: application/json
```

#### Exemplo de Resposta

```json
[
  {
    "clubId": "10754",
    "wins": "23",
    "losses": "15",
    "ties": "3",
    "gamesPlayed": "41",
    "gamesPlayedPlayoff": "0",
    "goals": "120",
    "goalsAgainst": "99",
    "cleanSheets": "7",
    "points": "40",
    "reputationtier": "0",
    "promotions": "4",
    "relegations": "1",
    "bestDivision": "3",
    "clubInfo": {
      "name": "Fera Enjaulada",
      "clubId": 10754,
      "regionId": 5456205,
      "teamId": 267,
      "customKit": {
        "stadName": "Tier 2 Stadium",
        "kitId": "2187265",
        "seasonalTeamId": "131404",
        "seasonalKitId": "1076461568",
        "selectedKitType": "1",
        "customKitId": "7524",
        "customAwayKitId": "7631",
        "customThirdKitId": "7543",
        "customKeeperKitId": "5007",
        "kitColor1": "15921906",
        "kitColor2": "16696614",
        "kitColor3": "592397",
        "kitColor4": "592397",
        "kitAColor1": "592397",
        "kitAColor2": "16696614",
        "kitAColor3": "592397",
        "kitAColor4": "16696614",
        "kitThrdColor1": "592397",
        "kitThrdColor2": "15101200",
        "kitThrdColor3": "592397",
        "kitThrdColor4": "15921906",
        "dCustomKit": "0",
        "crestColor": "0",
        "crestAssetId": "99160122"
      }
    },
    "platform": "common-gen5",
    "clubName": "Fera Enjaulada",
    "currentDivision": "3"
  }
]
```

---

### 2. Clubs Overall Stats By Club Ids

Retorna as estatísticas gerais de um ou mais clubes.

**Endpoint:** `GET /clubs/overallStats`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo       |
|------------|--------|-------------|------------------------------------|---------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5` |
| `clubIds`  | string | Sim         | ID(s) do(s) clube(s)               | `10754`       |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /clubs/overallStats?platform=common-gen5&clubIds=10754
Content-Type: application/json
```

#### Exemplo de Resposta

```json
[
  {
    "clubId": "10754",
    "bestDivision": "4",
    "bestFinishGroup": "6",
    "finishesInDivision1Group1": "0",
    "finishesInDivision2Group1": "0",
    "finishesInDivision3Group1": "0",
    "finishesInDivision4Group1": "0",
    "finishesInDivision5Group1": "0",
    "finishesInDivision6Group1": "0",
    "gamesPlayed": "138",
    "gamesPlayedPlayoff": "15",
    "goals": "437",
    "goalsAgainst": "386",
    "promotions": "11",
    "relegations": "2",
    "losses": "55",
    "ties": "17",
    "wins": "66",
    "lastMatch0": "3",
    "lastMatch1": "2",
    "lastMatch2": "1",
    "lastMatch3": "1",
    "lastMatch4": "1",
    "lastMatch5": "-1",
    "lastMatch6": "-1",
    "lastMatch7": "-1",
    "lastMatch8": "-1",
    "lastMatch9": "-1",
    "lastOpponent0": "149437",
    "lastOpponent1": "1236518",
    "lastOpponent2": "207391",
    "lastOpponent3": "2159780",
    "lastOpponent4": "240581",
    "lastOpponent5": "1892677",
    "lastOpponent6": "968986",
    "lastOpponent7": "3125464",
    "lastOpponent8": "1869732",
    "lastOpponent9": "2090660",
    "wstreak": "0",
    "unbeatenstreak": "1",
    "skillRating": "1800",
    "reputationtier": "1",
    "leagueAppearances": "123"
  }
]
```

---

### 3. Members Career Stats By Club Id

Retorna as estatísticas de carreira dos membros de um clube.

**Endpoint:** `GET /members/career/stats`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo       |
|------------|--------|-------------|------------------------------------|---------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5` |
| `clubId`   | string | Sim         | ID do clube                        | `10754`       |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /members/career/stats?platform=common-gen5&clubId=10754
Content-Type: application/json
```

#### Exemplo de Resposta

```json
{
  "members": [
    {
      "name": "edu__616",
      "proPos": "14",
      "gamesPlayed": "58",
      "goals": "40",
      "assists": "34",
      "manOfTheMatch": "4",
      "ratingAve": "7.7",
      "prevGoals": "0",
      "favoritePosition": "midfielder"
    },
    {
      "name": "Vcaliari",
      "proPos": "25",
      "gamesPlayed": "134",
      "goals": "83",
      "assists": "54",
      "manOfTheMatch": "4",
      "ratingAve": "7.4",
      "prevGoals": "1",
      "favoritePosition": "forward"
    },
    {
      "name": "jhouw80",
      "proPos": "5",
      "gamesPlayed": "44",
      "goals": "9",
      "assists": "17",
      "manOfTheMatch": "2",
      "ratingAve": "7.8",
      "prevGoals": "0",
      "favoritePosition": "defender"
    },
    {
      "name": "eduu_marques",
      "proPos": "14",
      "gamesPlayed": "85",
      "goals": "78",
      "assists": "93",
      "manOfTheMatch": "21",
      "ratingAve": "8.2",
      "prevGoals": "1",
      "favoritePosition": "midfielder"
    },
    {
      "name": "thealfhen",
      "proPos": "25",
      "gamesPlayed": "112",
      "goals": "133",
      "assists": "97",
      "manOfTheMatch": "24",
      "ratingAve": "8.1",
      "prevGoals": "1",
      "favoritePosition": "forward"
    },
    {
      "name": "Coomedia",
      "proPos": "14",
      "gamesPlayed": "110",
      "goals": "30",
      "assists": "49",
      "manOfTheMatch": "12",
      "ratingAve": "7.6",
      "prevGoals": "0",
      "favoritePosition": "midfielder"
    },
    {
      "name": "MMrotzeck",
      "proPos": "14",
      "gamesPlayed": "33",
      "goals": "5",
      "assists": "9",
      "manOfTheMatch": "4",
      "ratingAve": "7.3",
      "prevGoals": "0",
      "favoritePosition": "midfielder"
    },
    {
      "name": "IG0NES",
      "proPos": "14",
      "gamesPlayed": "8",
      "goals": "6",
      "assists": "0",
      "manOfTheMatch": "1",
      "ratingAve": "7.1",
      "prevGoals": "1",
      "favoritePosition": "midfielder"
    }
  ],
  "positionCount": {
    "midfielder": 5,
    "goalkeeper": 0,
    "forward": 2,
    "defender": 1
  }
}
```

---

### 4. Members Stats By Club Id

Retorna as estatísticas atuais dos membros de um clube.

**Endpoint:** `GET /members/stats`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo       |
|------------|--------|-------------|------------------------------------|---------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5` |
| `clubId`   | string | Sim         | ID do clube                        | `10754`       |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /members/stats?platform=common-gen5&clubId=10754
Content-Type: application/json
```

#### Exemplo de Resposta

```json
{
  "members": [
    {
      "name": "edu__616",
      "gamesPlayed": "58",
      "winRate": "53",
      "goals": "40",
      "assists": "34",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "36",
      "passesMade": "678",
      "passSuccessRate": "75",
      "ratingAve": "7.7",
      "tacklesMade": "62",
      "tackleSuccessRate": "15",
      "proName": "E. Florencio",
      "proPos": "14",
      "proStyle": "0",
      "proHeight": "182",
      "proNationality": "54",
      "proOverall": "78",
      "proOverallStr": "78",
      "manOfTheMatch": "4",
      "redCards": "1",
      "prevGoals": "1",
      "prevGoals1": "1",
      "prevGoals2": "2",
      "prevGoals3": "3",
      "prevGoals4": "3",
      "prevGoals5": "4",
      "prevGoals6": "0",
      "prevGoals7": "3",
      "prevGoals8": "3",
      "prevGoals9": "2",
      "prevGoals10": "1",
      "favoritePosition": "midfielder"
    },
    {
      "name": "Vcaliari",
      "gamesPlayed": "134",
      "winRate": "47",
      "goals": "83",
      "assists": "54",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "39",
      "passesMade": "1541",
      "passSuccessRate": "80",
      "ratingAve": "7.4",
      "tacklesMade": "97",
      "tackleSuccessRate": "17",
      "proName": "V. Caliari",
      "proPos": "25",
      "proStyle": "0",
      "proHeight": "169",
      "proNationality": "54",
      "proOverall": "84",
      "proOverallStr": "84",
      "manOfTheMatch": "4",
      "redCards": "1",
      "prevGoals": "5",
      "prevGoals1": "5",
      "prevGoals2": "1",
      "prevGoals3": "1",
      "prevGoals4": "7",
      "prevGoals5": "3",
      "prevGoals6": "0",
      "prevGoals7": "3",
      "prevGoals8": "2",
      "prevGoals9": "1",
      "prevGoals10": "1",
      "favoritePosition": "forward"
    },
    {
      "name": "jhouw80",
      "gamesPlayed": "44",
      "winRate": "50",
      "goals": "9",
      "assists": "17",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "13",
      "passesMade": "612",
      "passSuccessRate": "81",
      "ratingAve": "7.8",
      "tacklesMade": "74",
      "tackleSuccessRate": "22",
      "proName": "Jhoow",
      "proPos": "5",
      "proStyle": "0",
      "proHeight": "192",
      "proNationality": "54",
      "proOverall": "79",
      "proOverallStr": "79",
      "manOfTheMatch": "2",
      "redCards": "0",
      "prevGoals": "3",
      "prevGoals1": "3",
      "prevGoals2": "2",
      "prevGoals3": "1",
      "prevGoals4": "1",
      "prevGoals5": "1",
      "prevGoals6": "0",
      "prevGoals7": "0",
      "prevGoals8": "0",
      "prevGoals9": "0",
      "prevGoals10": "0",
      "favoritePosition": "defender"
    },
    {
      "name": "eduu_marques",
      "gamesPlayed": "85",
      "winRate": "52",
      "goals": "78",
      "assists": "93",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "31",
      "passesMade": "1332",
      "passSuccessRate": "77",
      "ratingAve": "8.2",
      "tacklesMade": "64",
      "tackleSuccessRate": "18",
      "proName": "V Roque",
      "proPos": "14",
      "proStyle": "0",
      "proHeight": "183",
      "proNationality": "54",
      "proOverall": "81",
      "proOverallStr": "81",
      "manOfTheMatch": "21",
      "redCards": "0",
      "prevGoals": "2",
      "prevGoals1": "2",
      "prevGoals2": "6",
      "prevGoals3": "9",
      "prevGoals4": "4",
      "prevGoals5": "8",
      "prevGoals6": "1",
      "prevGoals7": "2",
      "prevGoals8": "3",
      "prevGoals9": "1",
      "prevGoals10": "0",
      "favoritePosition": "midfielder"
    },
    {
      "name": "thealfhen",
      "gamesPlayed": "112",
      "winRate": "47",
      "goals": "133",
      "assists": "97",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "40",
      "passesMade": "1510",
      "passSuccessRate": "74",
      "ratingAve": "8.1",
      "tacklesMade": "69",
      "tackleSuccessRate": "14",
      "proName": "A. Bonmati",
      "proPos": "25",
      "proStyle": "0",
      "proHeight": "182",
      "proNationality": "45",
      "proOverall": "86",
      "proOverallStr": "86",
      "manOfTheMatch": "24",
      "redCards": "0",
      "prevGoals": "4",
      "prevGoals1": "4",
      "prevGoals2": "6",
      "prevGoals3": "2",
      "prevGoals4": "10",
      "prevGoals5": "8",
      "prevGoals6": "7",
      "prevGoals7": "7",
      "prevGoals8": "4",
      "prevGoals9": "2",
      "prevGoals10": "4",
      "favoritePosition": "forward"
    },
    {
      "name": "Coomedia",
      "gamesPlayed": "110",
      "winRate": "46",
      "goals": "30",
      "assists": "49",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "20",
      "passesMade": "1412",
      "passSuccessRate": "76",
      "ratingAve": "7.6",
      "tacklesMade": "147",
      "tackleSuccessRate": "25",
      "proName": "C H U C K Y",
      "proPos": "14",
      "proStyle": "0",
      "proHeight": "182",
      "proNationality": "54",
      "proOverall": "84",
      "proOverallStr": "84",
      "manOfTheMatch": "12",
      "redCards": "1",
      "prevGoals": "0",
      "prevGoals1": "0",
      "prevGoals2": "1",
      "prevGoals3": "1",
      "prevGoals4": "1",
      "prevGoals5": "1",
      "prevGoals6": "0",
      "prevGoals7": "0",
      "prevGoals8": "0",
      "prevGoals9": "0",
      "prevGoals10": "1",
      "favoritePosition": "midfielder"
    },
    {
      "name": "MMrotzeck",
      "gamesPlayed": "7",
      "winRate": "71",
      "goals": "0",
      "assists": "0",
      "cleanSheetsDef": "2",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "0",
      "passesMade": "52",
      "passSuccessRate": "71",
      "ratingAve": "6.7",
      "tacklesMade": "4",
      "tackleSuccessRate": "8",
      "proName": "B. Charlton",
      "proPos": "5",
      "proStyle": "0",
      "proHeight": "188",
      "proNationality": "54",
      "proOverall": "72",
      "proOverallStr": "72",
      "manOfTheMatch": "0",
      "redCards": "0",
      "prevGoals": "0",
      "prevGoals1": "0",
      "prevGoals2": "0",
      "prevGoals3": "0",
      "prevGoals4": "0",
      "prevGoals5": "0",
      "prevGoals6": "0",
      "prevGoals7": "0",
      "prevGoals8": "0",
      "prevGoals9": "0",
      "prevGoals10": "0",
      "favoritePosition": "defender"
    },
    {
      "name": "IG0NES",
      "gamesPlayed": "8",
      "winRate": "62",
      "goals": "6",
      "assists": "0",
      "cleanSheetsDef": "0",
      "cleanSheetsGK": "0",
      "shotSuccessRate": "54",
      "passesMade": "80",
      "passSuccessRate": "69",
      "ratingAve": "7.1",
      "tacklesMade": "12",
      "tackleSuccessRate": "27",
      "proName": "Ze Pikeno",
      "proPos": "14",
      "proStyle": "-1",
      "proHeight": "174",
      "proNationality": "54",
      "proOverall": "74",
      "proOverallStr": "74",
      "manOfTheMatch": "1",
      "redCards": "0",
      "prevGoals": "1",
      "prevGoals1": "1",
      "prevGoals2": "1",
      "prevGoals3": "2",
      "prevGoals4": "0",
      "prevGoals5": "0",
      "prevGoals6": "2",
      "prevGoals7": "0",
      "prevGoals8": "0",
      "prevGoals9": "0",
      "prevGoals10": "0",
      "favoritePosition": "midfielder"
    }
  ],
  "positionCount": {
    "midfielder": 4,
    "goalkeeper": 0,
    "forward": 2,
    "defender": 2
  }
}
```

---

### 5. Clubs Matches By Club Ids

Retorna as partidas de um ou mais clubes.

**Endpoint:** `GET /clubs/matches`

#### Query Parameters

| Parâmetro        | Tipo   | Obrigatório | Descrição                              | Exemplo          |
|------------------|--------|-------------|----------------------------------------|------------------|
| `platform`       | string | Sim         | Plataforma do jogo                     | `common-gen5`    |
| `clubIds`        | string | Sim         | ID(s) do(s) clube(s)                   | `10754`          |
| `matchType`      | string | Sim         | Tipo de partida                        | `friendlyMatch`  |
| `maxResultCount` | string | Não         | Número máximo de resultados retornados | `50`             |

#### Valores de `matchType`

| Valor           | Descrição               |
|-----------------|-------------------------|
| `friendlyMatch` | Partidas amistosas      |
| `leagueMatch`   | Partidas de liga        |
| `playoffMatch`  | Partidas de playoffs    |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /clubs/matches?platform=common-gen5&clubIds=10754&matchType=friendlyMatch
Content-Type: application/json
```

#### Exemplo de Resposta

```json
[
  {
    "matchId": "336118610940060",
    "timestamp": 1768624748,
    "timeAgo": {
      "number": 5,
      "unit": "days"
    },
    "clubs": {
      "10754": {
        "date": "1768624748",
        "gameNumber": "0",
        "goals": "2",
        "goalsAgainst": "3",
        "losses": "0",
        "matchType": "5",
        "result": "0",
        "score": "2",
        "season_id": "0",
        "TEAM": "99160122",
        "ties": "0",
        "winnerByDnf": "0",
        "wins": "0",
        "details": {
          "name": "Fera Enjaulada",
          "clubId": 10754,
          "regionId": 5456205,
          "teamId": 267,
          "customKit": {
            "stadName": "Tier 2 Stadium",
            "kitId": "2187265",
            "customKitId": "7524",
            "crestAssetId": "99160122"
          }
        }
      },
      "2575670": {
        "date": "1768624748",
        "gameNumber": "0",
        "goals": "3",
        "goalsAgainst": "2",
        "losses": "0",
        "matchType": "5",
        "result": "0",
        "score": "3",
        "season_id": "0",
        "TEAM": "99160211",
        "ties": "0",
        "winnerByDnf": "0",
        "wins": "0",
        "details": {
          "name": "Brothers tm",
          "clubId": 2575670,
          "regionId": 5456205,
          "teamId": 114815
        }
      }
    },
    "players": {
      "10754": {
        "922546779": {
          "archetypeid": "11",
          "assists": "0",
          "goals": "0",
          "goalsconceded": "3",
          "mom": "0",
          "passattempts": "19",
          "passesmade": "14",
          "pos": "midfielder",
          "rating": "7.60",
          "redcards": "0",
          "shots": "1",
          "tackleattempts": "9",
          "tacklesmade": "4",
          "playername": "Vcaliari"
        },
        "1954147954": {
          "archetypeid": "10",
          "assists": "1",
          "goals": "0",
          "goalsconceded": "3",
          "mom": "0",
          "passattempts": "22",
          "passesmade": "18",
          "pos": "midfielder",
          "rating": "7.70",
          "redcards": "0",
          "shots": "3",
          "tackleattempts": "5",
          "tacklesmade": "1",
          "playername": "eduu_marques"
        },
        "1004484267170": {
          "archetypeid": "12",
          "assists": "0",
          "goals": "1",
          "goalsconceded": "3",
          "mom": "0",
          "passattempts": "20",
          "passesmade": "14",
          "pos": "forward",
          "rating": "7.50",
          "redcards": "0",
          "shots": "3",
          "tackleattempts": "5",
          "tacklesmade": "0",
          "playername": "thealfhen"
        }
      },
      "2575670": {
        "1006107946828": {
          "archetypeid": "12",
          "assists": "1",
          "goals": "1",
          "goalsconceded": "2",
          "mom": "1",
          "passattempts": "17",
          "passesmade": "12",
          "pos": "forward",
          "rating": "8.10",
          "redcards": "0",
          "shots": "3",
          "tackleattempts": "2",
          "tacklesmade": "0",
          "playername": "lucau23"
        }
      }
    },
    "aggregate": {
      "10754": {
        "assists": 1,
        "goals": 2,
        "goalsconceded": 21,
        "mom": 0,
        "passattempts": 110,
        "passesmade": 83,
        "rating": 50.4,
        "redcards": 1,
        "shots": 11,
        "tackleattempts": 41,
        "tacklesmade": 8
      },
      "2575670": {
        "assists": 2,
        "goals": 3,
        "goalsconceded": 10,
        "mom": 1,
        "passattempts": 76,
        "passesmade": 61,
        "rating": 36.0,
        "redcards": 0,
        "shots": 6,
        "tackleattempts": 11,
        "tacklesmade": 1
      }
    }
  }
]
```

> **Nota:** A resposta foi simplificada para melhor legibilidade. A resposta completa inclui informações detalhadas de todos os jogadores, customização de kits e múltiplas partidas.

---

### 6. Clubs Info By Club Ids

Retorna informações detalhadas de um ou mais clubes.

**Endpoint:** `GET /clubs/info`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo       |
|------------|--------|-------------|------------------------------------|---------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5` |
| `clubIds`  | string | Sim         | ID(s) do(s) clube(s)               | `10754`       |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /clubs/info?platform=common-gen5&clubIds=10754
Content-Type: application/json
```

#### Exemplo de Resposta

```json
{
  "10754": {
    "name": "Fera Enjaulada",
    "clubId": 10754,
    "regionId": 5456205,
    "teamId": 267,
    "customKit": {
      "stadName": "Tier 2 Stadium",
      "kitId": "2187265",
      "seasonalTeamId": "131404",
      "seasonalKitId": "1076461568",
      "selectedKitType": "1",
      "customKitId": "7524",
      "customAwayKitId": "7631",
      "customThirdKitId": "7543",
      "customKeeperKitId": "5007",
      "kitColor1": "15921906",
      "kitColor2": "16696614",
      "kitColor3": "592397",
      "kitColor4": "592397",
      "kitAColor1": "592397",
      "kitAColor2": "16696614",
      "kitAColor3": "592397",
      "kitAColor4": "16696614",
      "kitThrdColor1": "592397",
      "kitThrdColor2": "15101200",
      "kitThrdColor3": "592397",
      "kitThrdColor4": "15921906",
      "dCustomKit": "0",
      "crestColor": "0",
      "crestAssetId": "99160122"
    }
  }
}
```

---

### 7. Current Season Leaderboard Search By Club Name

Busca clubes pelo nome no ranking da temporada atual.

**Endpoint:** `GET /currentSeasonLeaderboard/search`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo           |
|------------|--------|-------------|------------------------------------|-------------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5`     |
| `clubName` | string | Sim         | Nome do clube a ser pesquisado     | `Fera Enjaulada`  |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /currentSeasonLeaderboard/search?platform=common-gen5&clubName=Fera%20Enjaulada
Content-Type: application/json
```

#### Exemplo de Resposta

```json
[
  {
    "clubId": "10754",
    "wins": "37",
    "losses": "28",
    "ties": "12",
    "gamesPlayed": "77",
    "gamesPlayedPlayoff": "10",
    "goals": "253",
    "goalsAgainst": "217",
    "cleanSheets": "12",
    "points": "72",
    "reputationtier": "2",
    "promotions": "5",
    "relegations": "2",
    "bestDivision": "2",
    "clubInfo": {
      "name": "Fera Enjaulada",
      "clubId": 10754,
      "regionId": 5456205,
      "teamId": 267,
      "customKit": {
        "stadName": "Tier 2 Stadium",
        "kitId": "2187265",
        "seasonalTeamId": "131404",
        "seasonalKitId": "1076461568",
        "selectedKitType": "1",
        "customKitId": "7524",
        "customAwayKitId": "7631",
        "customThirdKitId": "7543",
        "customKeeperKitId": "5007",
        "kitColor1": "15921906",
        "kitColor2": "16696614",
        "kitColor3": "592397",
        "kitColor4": "592397",
        "kitAColor1": "592397",
        "kitAColor2": "16696614",
        "kitAColor3": "592397",
        "kitAColor4": "16696614",
        "kitThrdColor1": "592397",
        "kitThrdColor2": "15101200",
        "kitThrdColor3": "592397",
        "kitThrdColor4": "15921906",
        "dCustomKit": "0",
        "crestColor": "0",
        "crestAssetId": "99160122"
      }
    },
    "platform": "common-gen5",
    "clubName": "Fera Enjaulada",
    "currentDivision": "6"
  }
]
```

---

### 8. Playoff Achievements By Club Id

Retorna as conquistas de playoffs de um clube.

**Endpoint:** `GET /club/playoffAchievements`

#### Query Parameters

| Parâmetro  | Tipo   | Obrigatório | Descrição                          | Exemplo       |
|------------|--------|-------------|------------------------------------|---------------|
| `platform` | string | Sim         | Plataforma do jogo                 | `common-gen5` |
| `clubId`   | string | Sim         | ID do clube                        | `10754`       |

#### Headers

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

#### Exemplo de Requisição

```http
GET /club/playoffAchievements?platform=common-gen5&clubId=10754
Content-Type: application/json
```

#### Exemplo de Resposta

```json
[
  {
    "seasonId": "5",
    "seasonName": "CLUBS_LEAGUE_SEASON_04",
    "bestDivision": "3",
    "bestFinishGroup": "2"
  },
  {
    "seasonId": "4",
    "seasonName": "CLUBS_LEAGUE_SEASON_03",
    "bestDivision": "4",
    "bestFinishGroup": "6"
  },
  {
    "seasonId": "3",
    "seasonName": "CLUBS_LEAGUE_SEASON_02",
    "bestDivision": "6",
    "bestFinishGroup": "6"
  }
]
```

---

## 🎮 Plataformas Suportadas

| Valor         | Descrição                              |
|---------------|----------------------------------------|
| `common-gen5` | PlayStation 5 / Xbox Series X\|S / PC  |
| `common-gen4` | PlayStation 4 / Xbox One               |
| `nx`          | Nintendo Switch                        |

---

## 📝 Notas

- Todos os endpoints utilizam o método `GET`
- O header `Content-Type: application/json` é obrigatório em todas as requisições
- Os IDs de clubes podem ser obtidos através do endpoint de busca por nome

---

## 📌 Resumo dos Endpoints

| Método | Endpoint                          | Descrição                                      |
|--------|-----------------------------------|------------------------------------------------|
| GET    | `/allTimeLeaderboard/search`      | Buscar clube por nome (all-time)               |
| GET    | `/currentSeasonLeaderboard/search`| Buscar clube por nome (temporada atual)        |
| GET    | `/clubs/overallStats`             | Estatísticas gerais do clube                   |
| GET    | `/clubs/info`                     | Informações detalhadas do clube                |
| GET    | `/clubs/matches`                  | Partidas do clube                              |
| GET    | `/club/playoffAchievements`       | Conquistas de playoffs do clube                |
| GET    | `/members/career/stats`           | Estatísticas de carreira dos membros           |
| GET    | `/members/stats`                  | Estatísticas atuais dos membros                |

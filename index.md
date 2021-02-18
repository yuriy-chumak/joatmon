---
layout: html
categories: index
---

# Главная
Эта страничка является образцом (шаблоном) пользовательского интерфейса игры "joatmon".

## API

API делится на игровой и сервисный. Игровой API непосредственно участвует в процессе игры и обязательно требует заголовок запроса `X-Joatmon-SID: {session}`, что в дальнейшем указываться не будет.
Сервисный АПИ не требует указания игровой сессии.

Типы параметров обозначаются текстом в фигурных скобках, например:
* (string) - строка
* (id) или (number) - число

Типичное соответствие названия метода запроса и провоцируемого ним действия:
| Ресурс 	| POST | GET | PATCH | DELETE
|---------|------|-----|-------|--------
| /api/races | Создать новую расу | Показать список всех рас пользователя | - | -
| /api/races/12 |	- | Показать расу 12 | Обновить расу 12 | Удалить расу 12

## Сервисный API

#### Логин, `"/api/login"`

* `POST /api/login`, авторизоваться на сервере
  * `login`: логин
  * `password`: пароль
  * *200 OK* `json: {session}`
    * session используется во всем игровом API (но не в сервисном)
  * *401 Unauthorized*: логин и/или пароль не подходит
  * *403 Forbidden*: доступ запрещен / аккаунт деактивирован

Пример запроса (и ответа) через curl:

```bash
$ curl -v -X POST "http://127.0.0.1:4002/api/login" \
  --header "Content-Type: application/json"\
  --data '{"login":"user@1","password":"123456"}' |json_pp
{
   "session":"6879d340384cd257d6b0c8ce1780d54f"
}
```

## Игровой API

### Общий API

#### Пинг, `"/api/ping"`

* `GET /api/ping`
  * *200 OK* `json: {}`
  * *401 Unauthorized*
  * *403 Forbidden*, доступ запрещен / аккаунт деактивирован

```bash
$ curl -v -X GET "http://127.0.0.1:4002/api/ping" \
  --header "X-Joatmon-SID: 6879d340384cd257d6b0c8ce1780d54f" |json_pp
```

#### Логаут, `"/api/logout"`
* `POST /api/logout`, выйти с сервера
  * *200 OK* `json: {}`
  * *401 Unauthorized*


### Race API, Манипуляции с расой

#### Получить список всех рас игрока
* `GET /api/races`
  * *200 OK*, `json: [{id, name, readonly}, ...]`
    * `id`: идентификатор расы
    * `name`: название расы
    * `readonly`: можно ли расу редактировать (если раса уже участвует или участвовала в какой-то игре, редактировать ее больше нельзя)
  * *401 Unauthorized*

#### Получить список предсозданных в игре рас-шаблонов, вызов не требует указания сессии
* `GET /api/predefined-races`
  * *200 OK*, `json: [{id, name}, ...]`
    * `id`: идентификатор расы
    * `name`: название расы

#### Создать новую расу
* `POST /api/races`
  * `name`: {string}, уникальное название расы
  * `template`: {number}, одна из предсозданных, либо созданных ранее своих рас
    * Note: список предсозданных рас можно получить с помощью `/api/races/predefined`, список своих - `/api/races`
    * Note: параметр "Spend up to 50 leftover advantage points on" удален, если у вас остались лишние очки, то это ваши личные проблемы.
  * *200 OK*, `json: {id}`
    * id: идентификатор созданной расы
  * *401 Unauthorized*
  * *400 Bad Request*, если нельзя создать расу (например, такое имя уже зарегистрировано)

* `GET /api/races/{id}`, получить полное описание расы по ее идентификатору
  * *200 OK*, `json: {id, name, prt, ...}`
    * `id`: идентификатор расы
    * `name`: наименование расы
    * `prt`: Primary Racial Trait
    * `lrts`: Lesser Racial Traits
    * `habitation={}`: биологические условия расы
      * `gravity=[i,i]`: гравитация, [нижняя граница, верхняя граница]
      * `temperature=[i,i]`: температура, [нижняя граница, верхняя граница]
      * `radiation=[i,i]`: радиация, [нижняя граница, верхняя граница]
      * `immunity`: иммунитет к биологическим условиям обитания
      * `growth_rate`: максимальная скорость размножения
    * `economy={}`: экономические параметры
      * `colonists_per_resource`
      * `resources_per_factory`
      * `resources_to_build_factory`
      * `colonists_per_factory`
      * `factory_costs_less`
      * `minerals_per_mine`
      * `resources_to_build_main`
      * `colonists_per_main`
    * `science={}`, стоимость развития наук
      * `energy_cost`
      * `weapons_cost`
      * `propulsion_cost`
      * `construction_cost`
      * `electronics_cost`
      * `biotechnology_cost`
  * *401 Unauthorized*
  * *404 Not Found*
  * :speech_balloon: Note: используя session=0 можно получить информацию про predefined расу

* `DELETE /api/races/{id}`, удалить существующую расу
  * *200 OK*
  * *401 Unauthorized*
  * *404 Not Found*

* `PATCH /api/races/{id}`, обновить существующую расу
  * `id`: идентификатор расы
    * `name`: {string}, новое имя расы
    * `template`: {number > 0}, образец, по которому изменить расу
    * `template`: {number = 0}, обновить расу из параметров
      * `prt`: {number}, Primary Racial Trait
        * 0, (HE) Hyper-Expansion
        * 1, (SS) Super Stealth
        * 2, (WM) War Monger
        * 3, (CA) Claim Adjuster
        * 4, (IS) Inner-Strength
        * 5, (SD) Space Demolition
        * 6, (PP) Packet Physics
        * 7, (IST) Inter-Stellar Traveler
        * 8, (AR) Alternate Reality
        * 9, (JoAT) Jack of All Trades
      * `lrt`: {number}, Lesser Racial Traits
        * 1 IFE - Improved Fuel Efficiency
        * 2 NRSE - No Ram Scoop Engines
        * 4 TT - Total Terraforming
        * 8 CE - Cheap Engines
        * 16 ARM - Advanced Remote Mining
        * 32 OBRM - Only Basic Remote Mining
        * 64 ISB - Improved Starbases
        * 128 NAS - No Advanced Scanners
        * 256 GR - Generalized Research
        * 512 LSP - Low Starting Population
        * 1024 UR - Ultimate Recycling
        * 2048 BET - Bleeding Edge Technology
        * 4096 MA - Mineral Alchemy
        * 8192 RS - Regerating Shields
      * `gravity`: [{number=0..100}, {number=0..100}], гравитация [нижняя граница, верхняя граница]
      * `temperature`: [{number=0..100}, {number=0..100}], температура [нижняя граница, верхняя граница]
      * `radiation`: [{number=0..100}, {number=0..100}], радиация [нижняя граница, верхняя граница]
      * `immunity`: {bitfield=0..7}, иммунитет к
        * 1: gravity
        * 2: temperature
        * 4: radiation
      * `growth_rate`: {number}, максимальная скорость размножения
      * `colonists_per_resource`: {number=7..25}, ?100 колонистов производят 1 ресурс
      * `resources_per_factory`: {number}, каждые 10 фабрик производят 5..15 ресурсов в год
      * `resources_to_build_factory`: {number}, (5..25) ресурсов требуется для постройки одной фабрики
      * `colonists_per_factory`: {number}, каждые 10'000 колонистов могут управлять (5..25) фабриками
      * `factory_costs_less`: {number}, постройка фабрики стоит на (0,1) германиума меньше
      * `minerals_per_mine`: {number}, каждые 10 шахт производят (5..25) ресурсов в год
      * `resources_to_build_main`: {number}, (2..15) ресурсов требуется для постройки одной шахты
      * `colonists_per_main`: {number}, каждые 10'000 колонистов могут управлять (5..25) шахтами
      * `energy_cost`: {number=75|100|150}, развитие энергетики стоит N% обычной стоимости
      * `weapons_cost`: {number=75|100|150}, развитие вооружения стоит N% обычной стоимости
      * `propulsion_cost`: {number=75|100|150}, развитие двигателестроения стоит N% обычной стоимости
      * `construction_cost`: {number=75|100|150}, развитие строительства стоит N% обычной стоимости
      * `electronics_cost`: {number=75|100|150}, развитие электроники стоит N% обычной стоимости
      * `biotechnology_cost`: {number=75|100|150}, развитие биотехнологий стоит N% обычной стоимости
  * *200 OK*,
  * *401 Unauthorized*
  * *404 Not Found*


* `GET /api/races/{id}/games`, получить игры, в которых участвует раса
  * *200 OK*, `json: [{id, name}, ...]`
    * `id`: идентификатор игры
    * `name`: название игры
  * *401 Unauthorized*

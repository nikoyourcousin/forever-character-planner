import type { Locale } from './i18n'
import type { Faction } from './types'

export interface GuideSteps {
  spec: string
  points: string[]
}

export interface RouteStep {
  range: string
  text: string
}

export interface GuideBundle {
  skyborne: string
  classes: Record<string, GuideSteps>
  routes: Record<Faction, RouteStep[]>
  professions: Record<string, { points: string[] }>
  pairs: Record<string, string>
}

const trainers =
  'Ступени тренера около 50, 125 и 200, потолки 75, 150, 225 и 300.'

const legacy = 'Наследие за ремесло: 150, 225, 300. Кач на оранжевом и жёлтом.'

const ru: GuideBundle = {
  skyborne: 'Небожители стартуют на острове Зефры, 1–12. Дальше маршрут фракции.',
  classes: {
    warrior: {
      spec: 'Оружие до 60. Защита только под танк.',
      points: [
        'Медленное двуручное в соло, одноручное и щит в инсты.',
        'Латы: горное дело и кузнечное дело. Инженерия вместо кузнеца под ПвП.',
      ],
    },
    paladin: {
      spec: 'Воздаяние в соло. Свет, если сидишь хилом.',
      points: [
        'Урон с печати и суда. Узкое место — мана.',
        'Латы с горного дела и кузнеца. Отрекшийся идёт ордынским маршрутом.',
      ],
    },
    hunter: {
      spec: 'Повелитель зверей. Меткость, если в инстах нужен урон, а не пет.',
      points: [
        'Приоритет — оружие дальнего боя и корм. В пати с танком пет на пассиве.',
        'Снятие шкур и кожевничество: туши уже есть, с кожи колчаны и броня.',
      ],
    },
    rogue: {
      spec: 'Бой от оружия. Ликвидация — от ядов и открывашки.',
      points: [
        'Кожа до 40: снятие шкур и кожевничество.',
        'В пати урон со спины, не второй танк.',
      ],
    },
    priest: {
      spec: 'Свет под хил. Тьма, если качаешься кастом и не хочешь быть хилом пати.',
      points: [
        'Жезл закрывает простой по мане. В инсте от жреца ждут хил.',
        'Портняжное дело и наложение чар: ткань с гуманоидов.',
      ],
    },
    shaman: {
      spec: 'Совершенствование. Стихии, если пати берёт тебя кастером.',
      points: [
        'Тотем до пула. Призрачный волк на переход.',
        'Кожа и кольчуга: шкуры и кожевничество. С 40 кольчуга также с кузнеца.',
      ],
    },
    mage: {
      spec: 'Лёд на прокачку. Огонь, если контроль не нужен.',
      points: [
        'Вода со спелла, телепорт в город на сдачу и вендор.',
        'Портняжное дело и наложение чар.',
      ],
    },
    warlock: {
      spec: 'Демонология: бес держит. Колдовство, если урон с рук важнее пета.',
      points: [
        'Камни здоровья в пати до босса. В инсте с танком бес на пассиве.',
        'Портняжное дело и наложение чар.',
      ],
    },
    druid: {
      spec: 'Сила зверя: кошка на соло, медведь на пак. Исцеление только под хил.',
      points: [
        'Роль в инсте фиксируй до пула: один спек не закрывает танк и хил.',
        'Кожа всю дорогу: снятие шкур и кожевничество.',
      ],
    },
  },
  routes: {
    alliance: [
      { range: '1–12', text: 'Стартовая зона расы.' },
      { range: '12–20', text: 'Западный Край, Лок Модан, Тёмные берега. Мёртвые копи или Крепость Тенеклыка по квесту.' },
      { range: '20–30', text: 'Красногорье, Сумеречный лес, Болотина, Ясеневый лес.' },
      { range: '30–40', text: 'Тернистая долина, Бесплодные земли, Нагорье Арати, Пустоши.' },
      { range: '40–50', text: 'Танарис, Фералас, Внутренние земли, Выжженные земли.' },
      { range: '50–60', text: 'Ун’Горо, Осквернённый лес, Зимние Ключи, Чумные земли, Пылающие степи, Силитус.' },
    ],
    horde: [
      { range: '1–12', text: 'Стартовая зона расы.' },
      { range: '12–22', text: 'Степи. Пещеры стенаний по квесту.' },
      { range: '22–30', text: 'Когтистые горы, Ясеневый лес, Предгорья Хилсбрада, Тысяча Игл.' },
      { range: '30–40', text: 'Тернистая долина, Пустоши, Нагорье Арати, Пылевые топи.' },
      { range: '40–50', text: 'Танарис, Фералас, Внутренние земли.' },
      { range: '50–60', text: 'Ун’Горо, Осквернённый лес, Зимние Ключи, Чумные земли, Пылающие степи, Силитус.' },
    ],
  },
  professions: {
    alchemy: {
      points: ['Связка с травничеством.', trainers, 'Зелья лечения и маны своего уровня.', legacy],
    },
    blacksmithing: {
      points: ['Связка с горным делом, плавка сразу с ковкой.', trainers, 'Камни, пояса и броня своего уровня. Оружие — если жёлтое и под свой спек.', legacy],
    },
    enchanting: {
      points: ['Пыль с зелёных вещей, не с жил. Хорошо садится на портняжку.', trainers, 'Жезлы и чары на наручи, пока рецепт жёлтый.', legacy],
    },
    engineering: {
      points: ['Связка с горным делом. Бомбы, прицелы, очки, патроны. Материалы тяжелее, чем у кузнеца.', trainers, legacy],
    },
    leatherworking: {
      points: ['Связка со снятием шкур. Наборы брони, колчаны, сумки для боеприпасов.', trainers, 'После 40 часть рецептов — кольчуга под охотника и шамана.', legacy],
    },
    tailoring: {
      points: ['Ткань с гуманоидов, второе ремесло обычно чары. Сумки раньше брони.', trainers, legacy],
    },
    herbalism: {
      points: ['Очки со сбора. Ступень, когда узлы серые.', 'Связка с алхимией.', 'Наследия нет.'],
    },
    mining: {
      points: ['Очки с жил. Плавка у того же тренера, иначе нет слитков.', 'Связка с кузнецом или инженером.', 'Наследия нет.'],
    },
    skinning: {
      points: ['Очки со зверей и драконов.', 'Связка с кожевничеством.', 'Наследия нет.'],
    },
    cooking: {
      points: [
        'Вторичка, слот не занимает.',
        'В Forever еда даёт бонус к опыту.',
        'Кач на жёлтых рецептах мяса и рыбы своего уровня.',
      ],
    },
    fishing: {
      points: ['Вторичка. Кормит кулинарию, масло иногда нужно алхимии.', 'Серый клёв — вода уровнем выше или наживка.'],
    },
    firstaid: {
      points: ['Вторичка. Бинты из ткани текущего тира: лён, шерсть, шёлк, маготкань, руническая.', 'Имеет смысл на классах без своего хила.'],
    },
  },
  pairs: {
    warrior: 'Горное дело и кузнечное дело: латы до 60.',
    paladin: 'Горное дело и кузнечное дело: латы и камни.',
    hunter: 'Снятие шкур и кожевничество: кожа, колчаны, туши с пета.',
    rogue: 'Снятие шкур и кожевничество: кожа до 40.',
    priest: 'Портняжное дело и наложение чар.',
    shaman: 'Снятие шкур и кожевничество: кожа и кольчуга.',
    mage: 'Портняжное дело и наложение чар.',
    warlock: 'Портняжное дело и наложение чар.',
    druid: 'Снятие шкур и кожевничество: кожа всю прокачку.',
  },
}

const trainersEn = 'Trainer ranks around 50, 125, and 200. Caps at 75, 150, 225, and 300.'
const legacyEn = 'Legacy for this craft: 150, 225, 300. Skill up on orange and yellow.'

const en: GuideBundle = {
  skyborne: 'Skyborne start on Zephras Isle, 1–12. Then the faction route.',
  classes: {
    warrior: {
      spec: 'Arms to 60. Protection only when you are the tank.',
      points: [
        'Slow two-hander solo, sword and board in instances.',
        'Plate: mining and blacksmithing. Engineering instead of blacksmithing for PvP.',
      ],
    },
    paladin: {
      spec: 'Retribution solo. Holy if you are the healer.',
      points: ['Damage is seal and Judgment. Mana is the limit, not health.', 'Plate from mining and blacksmithing. Undead follow the Horde route.'],
    },
    hunter: {
      spec: 'Beast Mastery. Marksmanship if the group wants ranged damage over the pet.',
      points: ['Ranged weapon and pet food first. Pet on passive when a tank is present.', 'Skinning and leatherworking: the corpses are already there.'],
    },
    rogue: {
      spec: 'Combat from weapons. Assassination if you play poisons and the opener.',
      points: ['Leather until 40: skinning and leatherworking.', 'In a group, damage from behind.'],
    },
    priest: {
      spec: 'Holy to heal. Shadow if you level as a caster and will not heal the group.',
      points: ['Wand covers the mana downtime. Instances still expect a heal.', 'Tailoring and enchanting: cloth off humanoids.'],
    },
    shaman: {
      spec: 'Enhancement. Elemental if the group wants a caster.',
      points: ['Totem down before the pull. Ghost Wolf between camps.', 'Leather and mail: skinning and leatherworking. Mail from blacksmithing after 40 as well.'],
    },
    mage: {
      spec: 'Frost while leveling. Fire if you do not need the control.',
      points: ['Conjure water, teleport to town for turn-ins.', 'Tailoring and enchanting.'],
    },
    warlock: {
      spec: 'Demonology, the voidwalker holds. Destruction if your own damage matters more than the pet.',
      points: ['Healthstones out before the boss. Pet on passive when a tank is present.', 'Tailoring and enchanting.'],
    },
    druid: {
      spec: 'Feral: cat solo, bear on a pack. Restoration only to heal.',
      points: ['Lock the instance role before the pull. One tree does not cover tank and heal.', 'Leather the whole way: skinning and leatherworking.'],
    },
  },
  routes: {
    alliance: [
      { range: '1–12', text: 'Racial starting zone.' },
      { range: '12–20', text: 'Westfall, Loch Modan, Darkshore. Deadmines or Shadowfang Keep when the quest sends you.' },
      { range: '20–30', text: 'Redridge, Duskwood, Wetlands, Ashenvale.' },
      { range: '30–40', text: 'Stranglethorn, Badlands, Arathi Highlands, Desolace.' },
      { range: '40–50', text: 'Tanaris, Feralas, the Hinterlands, Blasted Lands.' },
      { range: '50–60', text: 'Un’Goro, Felwood, Winterspring, the Plaguelands, Burning Steppes, Silithus.' },
    ],
    horde: [
      { range: '1–12', text: 'Racial starting zone.' },
      { range: '12–22', text: 'The Barrens. Wailing Caverns when the quest sends you.' },
      { range: '22–30', text: 'Stonetalon, Ashenvale, Hillsbrad, Thousand Needles.' },
      { range: '30–40', text: 'Stranglethorn, Desolace, Arathi Highlands, Dustwallow.' },
      { range: '40–50', text: 'Tanaris, Feralas, the Hinterlands.' },
      { range: '50–60', text: 'Un’Goro, Felwood, Winterspring, the Plaguelands, Burning Steppes, Silithus.' },
    ],
  },
  professions: {
    alchemy: {
      points: ['Pair with herbalism.', trainersEn, 'Healing and mana potions of your level.', legacyEn],
    },
    blacksmithing: {
      points: ['Pair with mining. Smelt as you smith.', trainersEn, 'Stones, belts, and armor of your level. A weapon only while it is yellow and you will equip it.', legacyEn],
    },
    enchanting: {
      points: ['Dust from greens, not from nodes. Pairs with tailoring.', trainersEn, 'Wands and bracer enchants while the recipe is yellow.', legacyEn],
    },
    engineering: {
      points: ['Pair with mining. Bombs, scopes, goggles, ammo. Heavier on materials than blacksmithing.', trainersEn, legacyEn],
    },
    leatherworking: {
      points: ['Pair with skinning. Armor kits, quivers, ammo pouches.', trainersEn, 'After 40 some recipes are mail for hunters and shamans.', legacyEn],
    },
    tailoring: {
      points: ['Cloth from humanoids. Enchanting is the usual second craft. Bags before another armor piece.', trainersEn, legacyEn],
    },
    herbalism: {
      points: ['Points from picking. Train when nodes go gray.', 'Pair with alchemy.', 'No Legacy points.'],
    },
    mining: {
      points: ['Points from veins. Smelting is on the same trainer, or you have no bars.', 'Pair with blacksmithing or engineering.', 'No Legacy points.'],
    },
    skinning: {
      points: ['Points from beasts and dragonkin.', 'Pair with leatherworking.', 'No Legacy points.'],
    },
    cooking: {
      points: ['Secondary. Does not spend a primary slot.', 'In Forever, cooked food grants an experience bonus.', 'Skill up on yellow meat and fish of your level.'],
    },
    fishing: {
      points: ['Secondary. Feeds cooking. Oil sometimes feeds alchemy.', 'Gray pools mean higher-level water or bait.'],
    },
    firstaid: {
      points: ['Secondary. Bandages from the current cloth tier: linen, wool, silk, mageweave, runecloth.', 'Worth it on classes without a heal.'],
    },
  },
  pairs: {
    warrior: 'Mining and blacksmithing: plate to 60.',
    paladin: 'Mining and blacksmithing: plate and stones.',
    hunter: 'Skinning and leatherworking: leather, quivers, pet corpses.',
    rogue: 'Skinning and leatherworking: leather until 40.',
    priest: 'Tailoring and enchanting.',
    shaman: 'Skinning and leatherworking: leather and mail.',
    mage: 'Tailoring and enchanting.',
    warlock: 'Tailoring and enchanting.',
    druid: 'Skinning and leatherworking: leather the whole way.',
  },
}

export const guideBundles: Record<Locale, GuideBundle> = { ru, en }

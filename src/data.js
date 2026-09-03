export const topics = ['Trending','Combos','Perps','Breaking','New','Gospels','Torah','History','Prophets','Acts','Letters','Miracles','Parables','Wisdom','Revelation','Theology'];
export const marketTopics = ['All','Jesus','David','Moses','Peter','Paul','Genesis','Exodus','Psalms','Matthew','John','Acts','Miracles','Parables','Prophecy'];

const o=(label,probability)=>({label,probability});
export const markets = [
 {id:'fed-faith',type:'multi',title:'What does Jesus tell Peter to do after the miraculous catch?',category:'Gospels',reference:'Luke 5:4–11',tag:'Jesus',thumb:'jesus',activity:'82K picks',outcomes:[o('Follow me',.62),o('Return home',.38)]},
 {id:'live-exodus',type:'live',title:'Red Sea — What happens next?',category:'Torah',reference:'Exodus 14:21–22',tag:'Moses',thumb:'sea',activity:'LIVE · Exodus',probability:.51,outcomes:[o('Sea opens',.51),o('Sea stays closed',.49)]},
 {id:'resurrection-witness',type:'multi',title:'Who reaches Jesus’ tomb first?',category:'Gospels',reference:'John 20:1–8',tag:'Resurrection',thumb:'tomb',activity:'18K picks',outcomes:[o('The other disciple',.41),o('Peter',.22)]},
 {id:'david-goliath',type:'matchup',title:'David vs Goliath',category:'History',reference:'1 Samuel 17:40–51',tag:'David',thumb:'david',activity:'514K picks · 1 Samuel',teams:[{name:'David',abbr:'DAV',score:1,probability:.82},{name:'Goliath',abbr:'GOL',score:0,probability:.18}],outcomes:[o('David',.82),o('Goliath',.18)]},
 {id:'paul-silas',type:'matchup',title:'Paul & Silas — prison outcome',category:'Acts',reference:'Acts 16:25–34',tag:'Paul',thumb:'paul',activity:'300K picks · Acts',teams:[{name:'Freedom',abbr:'FREE',score:1,probability:.87},{name:'Remain jailed',abbr:'JAIL',score:0,probability:.13}],outcomes:[o('Freedom',.87),o('Remain jailed',.13)]},
 {id:'second-coming',type:'multi',title:'Which image appears in Revelation 21?',category:'Revelation',reference:'Revelation 21:1–4',tag:'Prophecy',thumb:'revelation',activity:'726K picks',outcomes:[o('New heaven & earth',1),o('A second flood',.01)]},
 {id:'jonah-nineveh',type:'multi',title:'Does Jonah go straight to Nineveh?',category:'Prophets',reference:'Jonah 1:1–3',tag:'Jonah',thumb:'jonah',activity:'64K picks',outcomes:[o('Yes',.47),o('No',.53)]},
 {id:'lazarus',type:'multi',title:'Will Lazarus come out when Jesus calls?',category:'Gospels',reference:'John 11:43–44',tag:'Jesus',thumb:'lazarus',activity:'611K picks',outcomes:[o('Yes',.96),o('No',.04)]},
 {id:'peter-water',type:'multi',title:'Will Peter step onto the water?',category:'Miracles',reference:'Matthew 14:28–31',tag:'Peter',thumb:'water',activity:'490K picks',outcomes:[o('Yes',.88),o('No',.12)]},
 {id:'abraham-isaac',type:'multi',title:'Will Abraham ultimately sacrifice Isaac?',category:'Torah',reference:'Genesis 22:9–13',tag:'Genesis',thumb:'mountain',activity:'388K picks',outcomes:[o('Yes',.14),o('No',.86)]},
 {id:'jericho',type:'multi',title:'Will Jericho’s walls fall after the shout?',category:'History',reference:'Joshua 6:20',tag:'Joshua',thumb:'walls',activity:'421K picks',outcomes:[o('Yes',.94),o('No',.06)]},
 {id:'armor-god',type:'multi',title:'Where is the armor of God described?',category:'Letters',reference:'Ephesians 6:10–18',tag:'Paul',thumb:'armor',activity:'246K picks',outcomes:[o('Ephesians 6',.91),o('Romans 8',.05)]}
];

export const featured = [
 {id:'feat-fed',marketId:'fed-faith',category:'Gospels · Luke',title:'What does Jesus tell Peter after the miraculous catch?',thumb:'jesus',volume:'82K picks',outcomes:[['Follow me',.62],['Return home',.38],['Sell the catch',.01],['Stay in the boat',.01]],comments:[['GraceAndTruth','Follow me changes everything.'],['FishersOfMen','The passage is so direct here.']]},
 {id:'feat-david',marketId:'david-goliath',category:'History · 1 Samuel',title:'Will David defeat Goliath?',thumb:'david',volume:'514K picks',outcomes:[['David wins',.83],['Goliath wins',.20],['Battle postponed',.01],['Saul fights',.01]],comments:[['psalm23','The confidence is in God, not armor.'],['ShepherdBoy','That sling is enough.']]},
 {id:'feat-lazarus',marketId:'lazarus',category:'Gospels · John',title:'Will Lazarus come out of the tomb?',thumb:'lazarus',volume:'611K picks',outcomes:[['Yes',.95],['No',.05],['Later',.01],['Martha enters',.01]],comments:[['Bethany','Jesus calls him by name.'],['MarthaFaith','John 11 is incredible.']]}
];

export const breaking = [
 ['Will David defeat Goliath?',.95, .77],
 ['Will Jonah go directly to Nineveh?',.12,-.65],
 ['Will Lazarus come out of the tomb?',.96,.20]
];
export const hotTopics = [['Jesus','942K today'],['David','3M today'],['Resurrection','4M today'],['Moses','4M today'],['Paul','16.1K today']];

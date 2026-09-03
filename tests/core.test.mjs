import test from 'node:test'; import assert from 'node:assert/strict';
import {formatPercent,payoutFor,filterMarkets,hashRoute} from '../src/core.js';
import {markets} from '../src/data.js';
test('formats probabilities',()=>{assert.equal(formatPercent(.826), '83%');assert.equal(formatPercent(2),'100%')});
test('calculates virtual projected return',()=>{assert.equal(payoutFor(25,.5),50);assert.equal(payoutFor(0,.5),0)});
test('filters by Bible topic and query',()=>{assert.ok(filterMarkets(markets,'lazarus','All').some(m=>m.id==='lazarus'));assert.ok(filterMarkets(markets,'','David').every(m=>`${m.title} ${m.tag}`.toLowerCase().includes('david')))});
test('parses routes',()=>{assert.deepEqual(hashRoute('#/markets'),{name:'markets'});assert.deepEqual(hashRoute('#/event/david-goliath'),{name:'event',id:'david-goliath'});assert.deepEqual(hashRoute('#/'),{name:'home'})});
test('market families exist',()=>{const types=new Set(markets.map(m=>m.type));assert.ok(types.has('multi'));assert.ok(types.has('live'));assert.ok(types.has('matchup'))});

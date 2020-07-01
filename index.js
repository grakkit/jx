const _ = core.import('grakkit/framework');

const command = {
   on: (name) => {
      let tab = () => [];
      let run = () => {};
      const that = {
         tab: (handler) => {
            tab = handler;
            return that;
         },
         run: (handler) => {
            run = handler;
            return that;
         }
      };
      core.command({
         name: name,
         execute: (...args) => run(...args),
         tabComplete: (player, ...args) => tab(player, args.length, ...args) || []
      });
      return that;
   }
};

const event = {
   on: (shortcut) => {
      const prefixes = [];
      let index = event.version;
      while (index < 3) {
         prefixes.push(...event.prefixes[index++]);
      }
      let type = undefined;
      const suffix = `${_.pascal(shortcut)}Event`;
      prefixes.forEach((prefix) => {
         if (type === undefined) {
            try {
               Java.type(`${prefix}.${suffix}`);
               type = `${prefix}.${suffix}`;
            } catch (error) {}
         }
      });
      if (type === undefined) {
         throw 'EventError: That event does not exist!';
      } else {
         const steps = [];
         const that = {
            if: (condition) => {
               steps.push({ type: 'condition', item: condition });
               return that;
            },
            do: (listener) => {
               steps.push({ type: 'listener', item: listener });
               return that;
            }
         };
         core.event(type, (event) => {
            if (event instanceof Java.type(type)) {
               const storage = {};
               const cancellable = event instanceof Java.type('org.bukkit.event.Cancellable');
               let ready = true;
               steps.forEach((step) => {
                  switch (step.type) {
                     case 'condition':
                        switch (typeof step.item) {
                           case 'boolean':
                              if (cancellable && step.item === event.isCancelled()) ready = false;
                              break;
                           case 'function':
                              if (!step.item(event, storage)) ready = false;
                              break;
                           case 'object':
                              if (!_.match(_.access(event), step.item)) ready = false;
                              break;
                        }
                        break;
                     case 'listener':
                        if (ready) {
                           try {
                              step.item(event, storage);
                           } catch (error) {
                              // note: do something better here
                              ready = false;
                              throw error;
                           }
                        }
                        break;
                  }
               });
            }
         });
         return that;
      }
   },
   prefixes: [
      [
         'com.destroystokyo.paper.event.block',
         'com.destroystokyo.paper.event.entity',
         'com.destroystokyo.paper.event.executor',
         'com.destroystokyo.paper.event.player',
         'com.destroystokyo.paper.event.profile',
         'com.destroystokyo.paper.event.server'
      ],
      [ 'org.spigotmc.event.entity', 'org.spigotmc.event.player' ],
      [
         'org.bukkit.event.block',
         'org.bukkit.event.command',
         'org.bukkit.event.enchantment',
         'org.bukkit.event.entity',
         'org.bukkit.event.hanging',
         'org.bukkit.event.inventory',
         'org.bukkit.event.player',
         'org.bukkit.event.raid',
         'org.bukkit.event.server',
         'org.bukkit.event.vehicle',
         'org.bukkit.event.weather',
         'org.bukkit.event.world'
      ]
   ],
   version: (() => {
      let version = 0;
      try {
         Java.type('com.destroystokyo.paper.event.player.IllegalPacketEvent');
      } catch (error) {
         version = 1;
         try {
            Java.type('org.spigotmc.event.player.PlayerSpawnLocationEvent');
         } catch (error) {
            version = 2;
         }
      }
      return version;
   })()
};

const $ = (object, ...args) => {
   if ([ null, undefined ].includes(object)) {
      return object;
   } else {
      switch (typeof object) {
         case 'string':
            const prefix = object[0];
            const suffix = object.slice(1);
            switch (prefix) {
               case '~':
                  if ($[suffix]) {
                     return $[suffix];
                  } else {
                     $[suffix] = _.object(_.array(Java.type(suffix).values()), (value) => {
                        if (!args[0] || !args[0](value)) {
                           let name = '';
                           if (args[1]) name = args[1](value);
                           else if (typeof value.getKey === 'function') name = value.getKey().getKey();
                           else name = _.lower(value.name());
                           return { [name]: value, [value]: name };
                        }
                     });
                     const words = [];
                     let index = -1;
                     suffix.split('.').forEach((node) => {
                        node.split('').map((char) => {
                           if (char === _.upper(char)) words[++index] = char;
                           else if (words[index]) words[index] += char;
                        });
                        ++index;
                     });
                     const terms = _.flat(words);
                     let key = '';
                     if (terms.length < 3) key = _.camel(terms.join(' '), ' ');
                     else if (terms.length === 3) key = _.lower(terms[0][0] + terms[1][0]) + terms[2];
                     else key = _.lower(terms.slice(0, -2).map((term) => term[0]).join('')) + terms.slice(-2).join('');
                     return ($[key] = $[suffix]);
                  }
               case '!':
                  const item = new (Java.type('org.bukkit.inventory.ItemStack'))($.material[suffix]);
                  return one('item', item.ensureServerConversions());
               case '@':
                  const context = args[0] || server.getConsoleSender();
                  return all('entity', ..._.array(server.selectEntities(context, object)));
               case '#':
                  return core.data(suffix, args[0]);
               case '?':
                  return one('entity', args[0].world.spawnEntity(args[0], $.entityType[suffix]));
               case '*':
                  return event.on(suffix);
               case '/':
                  return command.on(suffix);
               default:
                  return _.player(object);
            }
         case 'object':
            if (object instanceof Java.type('org.bukkit.block.Block')) {
               return one('block', object);
            } else if (object instanceof Java.type('org.bukkit.entity.Entity')) {
               return one('entity', object);
            } else if (object instanceof Java.type('org.bukkit.inventory.ItemStack')) {
               return one('item', object);
            } else if (object.constructor === Array) {
               if ([ null, undefined ].includes(object[0])) {
                  return object[0];
               } else if (object[0].constructor === Object) {
                  return parsers[object[0].format](object[0]);
               } else if (typeof object === 'object') {
                  return $(object[0]).serialize();
               } else {
                  return null;
               }
            } else {
               return null;
            }
      }
   }
};

$('~org.bukkit.Material', (value) => value.isLegacy());
$('~org.bukkit.entity.EntityType', (value) => value.name() === 'UNKNOWN');

import * as block from './library/block.min.js';

$('~org.bukkit.block.BlockFace');

import * as entity from './library/entity.min.js';

$('~org.bukkit.GameMode');
$('~org.bukkit.boss.BarFlag');
$('~org.bukkit.boss.BarColor');
$('~org.bukkit.boss.BarStyle');
$('~org.bukkit.attribute.Attribute', null, (value) => value.getKey().getKey().split('.')[1]);
$('~org.bukkit.inventory.EquipmentSlot');
$('~org.bukkit.potion.PotionEffectType', null, (value) => value.getHandle().c().split('.')[2]);

import * as item from './library/item.min.js';

$('~org.bukkit.inventory.ItemFlag');
$('~org.bukkit.enchantments.Enchantment');
$('~org.bukkit.attribute.AttributeModifier.Operation');

const wrappers = {
   block: block.wrapper(_, $),
   entity: entity.wrapper(_, $),
   item: item.wrapper(_, $)
};

const chainers = {
   block: block.chainer(_, $),
   entity: entity.chainer(_, $),
   item: item.chainer(_, $)
};

const parsers = {
   block: block.parser(_, $),
   entity: entity.parser(_, $),
   item: item.parser(_, $)
};

const links = {
   block: block.links,
   entity: entity.links,
   item: item.links
};

const one = (type, instance) => {
   const that = chainers[type](wrappers[type](instance));
   const output = _.object(links[type], (link) => {
      return {
         [link]: (...args) => {
            const result = that[link](...args);
            return that === result ? output : result[0];
         }
      };
   });
   return output;
};

const all = (type, ...instances) => {
   const that = chainers[type](...instances.map((instance) => wrappers[type](instance)));
   return _.extend(
      that,
      ...Object.getOwnPropertyNames(Array.prototype).map((key) => {
         const value = Array.prototype[key];
         if (typeof value === 'function') {
            return { [key]: (...args) => value.apply(instances, args) };
         }
      })
   );
};

core.export($);

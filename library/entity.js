const UUID = Java.type('java.util.UUID');
const Sound = Java.type('org.bukkit.Sound');
const Entity = Java.type('org.bukkit.entity.Entity');
const Player = Java.type('org.bukkit.entity.Player');
const Vector = Java.type('org.bukkit.util.Vector');
const Location = Java.type('org.bukkit.Location');
const ItemStack = Java.type('org.bukkit.inventory.ItemStack');
const LivingEntity = Java.type('org.bukkit.entity.LivingEntity');
const Attributable = Java.type('org.bukkit.attribute.Attributable');
const NamespacedKey = Java.type('org.bukkit.NamespacedKey');
const TextComponent = Java.type('net.md_5.bungee.api.chat.TextComponent');
const ChatMessageType = Java.type('net.md_5.bungee.api.ChatMessageType');
const InventoryHolder = Java.type('org.bukkit.inventory.InventoryHolder');

// a nice beat
// /js global.p=$(self);_.interval(()=>{p.note('block_note_block_bass',1,{}),p.note('block_note_block_bit',1,{})},350);_.interval(()=>{p.note('block_note_block_snare', 1,{})},350*4);_.interval(()=>{p.note('block_note_block_basedrum',1,{})},350*2);

const util = {
   attribute: {
      max_health: [ 0, 1024 ],
      follow_range: [ 0, 2048 ],
      knockback_resistance: [ 0, 1 ],
      movement_speed: [ 0, 1024 ],
      attack_damage: [ 0, 2048 ],
      armor: [ 0, 30 ],
      armor_toughness: [ 0, 20 ],
      attack_knockback: [ 0, 5 ],
      attack_speed: [ 0, 1024 ],
      luck: [ -1024, 1024 ],
      jump_strength: [ 0, 2 ],
      flying_speed: [ 0, 1024 ],
      spawn_reinforcements: [ 0, 1 ]
   },
   equipment: {
      chest: 'chestplate',
      feet: 'boots',
      hand: 'itemInMainHand',
      head: 'helmet',
      legs: 'leggings',
      off_hand: 'itemInOffHand'
   },
   notes: [
      0.5, //                    converted
      0.52972412109375, //       converted
      0.56121826171875, //       converted
      0.5945892333984375, //     converted
      0.6299591064453125, //     converted
      0.6674199270850172,
      0.7071067811865476,
      0.7491535384383408,
      0.7937005259840997,
      0.8408964152537145,
      0.8908987181403393,
      0.9438743126816934,
      1, //                      converted
      1.0594630943592953,
      1.122462048309373,
      1.189207115002721,
      1.2599210498948732,
      1.3348398541700344,
      1.4142135623730951,
      1.4983070768766815,
      1.5874010519681996,
      1.681792830507429,
      1.7817974362806785,
      1.887748625363387,
      2 //                      converted
   ]
};

export const wrapper = (_, $) => {
   return (instance) => {
      const alive = instance instanceof LivingEntity;
      const attributable = instance instanceof Attributable;
      const player = instance instanceof Player;
      const inventory = instance instanceof InventoryHolder;
      const thing = {
         get ai () {
            if (alive) return instance.hasAI();
         },
         set ai (value) {
            alive && instance.setAI(value);
         },
         get attribute () {
            return _.define($('+').fronts('attribute'), (entry) => {
               if (attributable) {
                  const attribute = instance.getAttribute(entry.value);
                  if (attribute) {
                     return {
                        get: () => {
                           return attribute.getBaseValue();
                        },
                        set: (value) => {
                           if (value === null || typeof value === 'number') {
                              _.def(value) || (value = attribute.getDefaultValue());
                              attribute.setBaseValue(_.clamp(value, ...util.attribute[entry.key]));
                           } else {
                              throw 'You must supply a null value or a numeric value!';
                           }
                        }
                     };
                  }
               }
            });
         },
         set attribute (value) {
            if (typeof value === 'object') {
               value || (value = {});
               try {
                  _.keys($('+').fronts('attribute')).forEach((key) => (thing.attribute[key] = value[key] || null));
               } catch (error) {
                  throw 'That input contains invalid entries!';
               }
            } else {
               throw 'You must supply an object or a null value!';
            }
         },
         bar: (key) => {
            try {
               typeof key === 'string' && (key = new NamespacedKey(...key.split(':')));
            } catch (value) {
               throw 'SyntaxError: Could not convert string into namespaced key!';
            }
            if (key instanceof NamespacedKey) {
               if (player) {
                  let bar = server.getBossBar(key);
                  if (!bar) {
                     bar = server.createBossBar(key, '', $.barColor.white, $.barStyle.solid);
                     bar.addPlayer(instance);
                  }
                  return bar;
               }
            } else {
               throw 'TypeError: You must supply a string value or a namespaced key!';
            }
         },
         get bars () {
            if (player) return _.array(server.getBossBars());
         },
         set bars (value) {
            if (_.iterable(value)) {
               const input = value.map((key) => {
                  try {
                     return key instanceof NamespacedKey ? key : new NamespacedKey(...key.split(':'));
                  } catch (error) {
                     throw 'TypeError: That array contains invalid namespaced keys!';
                  }
               });
               player && thing.bars.forEach((bar) => bar.removePlayer(instance));
               player && input.forEach((key) => server.getBossBar(key).addPlayer(instance));
            } else {
               throw 'TypeError: You must supply an array of namespaced keys!';
            }
         },
         get block () {
            return instance.getLocation().getBlock();
         },
         get collidable () {
            if (alive) return instance.isCollidable();
         },
         set collidable (value) {
            if (typeof value === 'boolean') {
               alive && instance.setCollidable(value);
            } else {
               throw 'TypeError: You must supply a boolean value!';
            }
         },
         get data () {
            return $('+').data(instance.getPersistentDataContainer());
         },
         set data (value) {
            if (typeof value === 'object') {
               $('+').data(instance.getPersistentDataContainer(), value);
            } else {
               throw 'TypeError: You must supply an object or null value!';
            }
         },
         distance: (target, option) => {
            try {
               return $('+').distance(instance.getLocation(), target, option);
            } catch (error) {
               switch (error) {
                  case 'invalid-both':
                  case 'invalid-source':
                     throw 'ImpossibleError: How the fuck are you seeing this error!?';
                  case 'invalid-target':
                     throw 'TypeError: Argument 1 must be a location, vector, or have a location or vector attached!';
               }
            }
         },
         get effect () {
            return _.define($('+').fronts('peType'), (entry) => {
               if (alive) {
                  return {
                     get: () => {
                        const effect = instance.getPotionEffect(entry.value);
                        if (effect) return { duration: effect.getDuration(), amplifier: effect.getAmplifier() + 1 };
                        else return null;
                     },
                     set: (value) => {
                        if (typeof value === 'object') {
                           value || (value = {});
                           const duration = _.clamp(value.duration || 0, 0, 2147483647);
                           const amplifier = _.clamp(value.amplifier || 0, 0, 255);
                           if (duration > 0 && amplifier > 0) {
                              instance.addPotionEffect(entry.value.createEffect(duration, amplifier - 1), true);
                           } else {
                              instance.removePotionEffect(entry.value);
                           }
                        } else {
                           throw 'TypeError: You must supply an object or a null value!';
                        }
                     }
                  };
               }
            });
         },
         set effect (value) {
            if (typeof value === 'object') {
               value || (value = {});
               try {
                  _.keys($('+').fronts('peType')).forEach((key) => (thing.effect[key] = value[key] || null));
               } catch (error) {
                  throw 'TypeError: That input contains invalid entries!';
               }
            } else {
               throw 'TypeError: You must supply an object or a null value!';
            }
         },
         get equipment () {
            return _.define($('+').fronts('equipmentSlot'), (entry) => {
               if (alive) {
                  const slot = util.equipment[entry.key];
                  const pascal = _.pascal(slot);
                  return {
                     get: () => {
                        return instance.getEquipment()[`get${pascal}`]();
                     },
                     set: (value) => {
                        value = $('+').instance(value);
                        if (value === null || value instanceof ItemStack) {
                           instance.getEquipment()[`set${pascal}`](value);
                        } else {
                           throw 'TypeError: You must supply an item stack or a null value!';
                        }
                     }
                  };
               }
            });
         },
         set equipment (value) {
            if (typeof value === 'object') {
               value || (value = {});
               try {
                  _.keys($('+').fronts('equipmentSlot')).forEach((key) => (thing.equipment[key] = value[key] || null));
               } catch (error) {
                  throw 'TypeError: That input contains invalid entries!';
               }
            } else {
               throw 'TypeError: You must supply an object or a null value!';
            }
         },
         get glowing () {
            return instance.isGlowing();
         },
         set glowing (value) {
            if (typeof value === 'boolean') {
               instance.setGlowing(value);
            } else {
               throw 'TypeError: You must supply a boolean value!';
            }
         },
         get health () {
            if (alive) return instance.getHealth();
         },
         set health (value) {
            if (typeof value === 'number') {
               alive && instance.setHealth(_.clamp(value, 0, instance.getMaxHealth()));
            } else {
               throw 'TypeError: You must supply a numeric value!';
            }
         },
         get instance () {
            return instance;
         },
         get inventory () {
            if (inventory) return [ ...instance.getInventory() ];
         },
         set inventory (value) {
            if (_.iterable(value)) {
               value = value.map((item) => {
                  item = $('+').instance(item);
                  if (item instanceof ItemStack) return item;
                  else throw 'TypeError: That array contains non-items!';
               });
               if (inventory) instance.getInventory().setContents($('+').instance(value));
            } else {
               throw 'TypeError: You must supply an array of items!';
            }
         },
         get invulnerable () {
            return instance.isInvulnerable();
         },
         set invulnerable (value) {
            if (typeof value === 'boolean') {
               instance.setInvulnerable(value);
            } else {
               throw 'TypeError: You must supply a boolean value!';
            }
         },
         get item () {
            return instance.getItemInHand();
         },
         set item (value) {
            value = $('+').instance(value);
            if (value === null || value instanceof ItemStack) {
               instance.setItemInHand(value);
            } else {
               throw 'TypeError: You must supply an item stack or a null value!';
            }
         },
         get lifeform () {
            return $('+').backs('entityType')[instance.getType()];
         },
         get location () {
            return instance.getLocation();
         },
         set location (value) {
            value = $('+').instance(value);
            typeof value.getLocation === 'function' && (value = value.getLocation());
            value instanceof Vector && (value = value.toLocation(thing.world));
            if (value instanceof Location) {
               instance.teleport(value);
            } else {
               throw 'TypeError: You must specify a location, vector, or object with a location or vector attached!';
            }
         },
         get mode () {
            if (player) return $('+').backs('gameMode')[instance.getGameMode()];
         },
         set mode (value) {
            if (player) instance.setGameMode($('+').fronts('gameMode')[value]);
         },
         get name () {
            if (player) {
               return instance.getDisplayName();
            } else {
               return instance.getCustomName();
            }
         },
         set name (value) {
            if (typeof value === 'string' || value === null) {
               _.def(value) && (value = '\u00a7r' + value);
               if (player) {
                  instance.setDisplayName(value);
                  instance.setPlayerListName(value);
               } else {
                  instance.setCustomName(value);
                  instance.setCustomNameVisible(value !== null);
               }
            } else {
               throw 'TypeError: You must specify a string value or a null value!';
            }
         },
         get nbt () {
            return _.serialize(instance.getHandle().save(new _.nms.NBTTagCompound()));
         },
         set nbt (value) {
            instance.getHandle().load(_.parse(value));
         },
         note: (sound, pitch, options) => {
            thing.sound(sound, Object.assign(options || {}, { pitch: util.notes[pitch || 0] }));
         },
         get passengers () {
            return $(_.array(instance.getPassengers()));
         },
         set passengers (value) {
            if (_.iterable(value)) {
               const input = value.map((entity) => {
                  entity instanceof UUID && (entity = server.getEntity(entity));
                  if (entity instanceof Entity) return entity;
                  else throw 'TypeError: That array contains invalid entity entries!';
               });
               instance.getPassengers().forEach((entity) => instance.removePassenger(entity));
               input.forEach((entity) => instance.addPassenger(entity));
            } else {
               throw 'TypeError: You must supply an array of entities!';
            }
         },
         get player () {
            if (player) return _.player(instance);
         },
         remove: () => {
            if (player) instance.kickPlayer('');
            else instance.remove();
         },
         get silent () {
            return instance.isSilent();
         },
         set silent (value) {
            if (typeof value === 'boolean') {
               instance.setSilent(value);
            } else {
               throw 'TypeError: You must supply a boolean value!';
            }
         },
         get sneaking () {
            if (player) return instance.isSneaking();
         },
         set sneaking (value) {
            if (typeof value === 'boolean') {
               if (player) instance.setSneaking(value);
            } else {
               throw 'TypeError: You must supply a boolean value!';
            }
         },
         sound: (noise, options) => {
            noise instanceof Sound || (noise = $('+').fronts('sound')[noise]);
            if (_.def(noise)) {
               options || (options = {});
               if (options.location) {
                  const value = options.location;
                  value = $('+').instance(value);
                  typeof value.getLocation === 'function' && (value = value.getLocation());
                  value instanceof Vector && (value = value.toLocation(thing.world));
                  if (value instanceof Location) {
                     options.location = value;
                  } else {
                     throw 'TypeError: The location you specified in your options was invalid!';
                  }
               }
               if (options.category) {
                  const value = options.category;
                  value instanceof SoundCategory || (value = $('+').fronts('soundCategory')[value]);
                  if (_.def(value)) {
                     options.category = value;
                  } else {
                     throw 'TypeError: The sound category you specified in your options was invalid!';
                  }
               }
               if (_.def(options.volume) && typeof options.volume !== 'number') {
                  throw 'TypeError: The volume level you specified in your options was invalid!';
               }
               if (_.def(options.pitch) && typeof options.pitch !== 'number') {
                  throw 'TypeError: The pitch value you specified in your options was invalid!';
               }
               if (player) {
                  instance.playSound(
                     options.location || instance.getLocation(),
                     noise,
                     options.category || $.soundCategory.master,
                     _.def(options.volume) ? options.volume : 1,
                     _.def(options.pitch) ? options.pitch : 1
                  );
               }
            } else {
               throw 'TypeError: That sound does not exist!';
            }
         },
         get tags () {
            return _.array(instance.getScoreboardTags());
         },
         set tags (value) {
            if (_.iterable(value)) {
               const input = value.map((entry) => {
                  if (typeof entry === 'string') return entry;
                  else throw 'TypeError: That array contains a non-string value!';
               });
               instance.getScoreboardTags().clear();
               input.map((entry) => instance.getScoreboardTags().add(entry));
            } else {
               throw 'TypeError: You must supply an array of string values!';
            }
         },
         text: (message, type, raw) => {
            if (player) {
               typeof type === 'boolean' && (raw = type);
               raw || (message = _.color(message));
               switch (type) {
                  case 'action':
                     instance.sendMessage(ChatMessageType.ACTION_BAR, new TextComponent(message));
                     break;
                  case 'title':
                     instance.sendTitle(...message.split('\n'), 10, 70, 20);
                     break;
                  case 'chat':
                  case 'standard':
                  case 'text':
                  case undefined:
                     instance.sendMessage(message);
                     break;
                  default:
                     throw 'TypeError: That is not a valid message type!';
               }
            }
         },
         get uuid () {
            return instance.getUniqueId().toString();
         },
         get vector () {
            return thing.location.toVector();
         },
         set vector (value) {
            value = $('+').instance(value);
            typeof value.getLocation === 'function' && (value = value.getLocation());
            if (value instanceof Vector || value instanceof Location) {
               thing.location = $(thing.location).x(value.getX()).y(value.getY()).z(value.getZ());
            } else {
               throw 'TypeError: You must specify a location, vector, or object with a location or vector attached!';
            }
         },
         get velocity () {
            return instance.getVelocity();
         },
         set velocity (value) {
            value = $('+').instance(value);
            typeof value.getLocation === 'function' && (value = value.getLocation());
            value instanceof Location && (value = value.toVector());
            if (value instanceof Vector) {
               instance.setVelocity(value);
            } else {
               throw 'TypeError: You must specify a location, vector, or object with a location or vector attached!';
            }
         },
         get vitality () {
            if (alive) return instance.getMaxHealth();
         },
         set vitality (value) {
            if (typeof value === 'number') {
               if (alive) instance.setMaxHealth(value);
            } else {
               throw 'TypeError: You must supply a numeric value!';
            }
         },
         get world () {
            return instance.getLocation().getWorld();
         },
         set world (world) {
            if (_.def(world)) {
               world instanceof World || (world = server.getWorld(world));
               if (_.def(world)) return instance.teleport(world.getSpawnLocation());
               else throw 'ReferenceError: That world does not exist!';
            } else {
               throw 'TypeError: You must specify a world, world name or UUID!';
            }
         }
      };
      return thing;
   };
};

export const parser = (_, $) => {
   return (input) => {
      return $(`?${input.lifeform}`, $(input.location)).nbt(input.nbt);
   };
};

export const chain = (_, $) => {
   return {
      ai: 'setter',
      attribute: 'setterNest',
      bar: 'runnerLink',
      bars: 'setterLink',
      block: 'getterLink',
      collidable: 'setter',
      data: 'appender',
      distance: 'runner',
      effect: 'setterNest',
      equipment: 'setterLinkNest',
      glowing: 'setter',
      health: 'setter',
      instance: 'getter',
      inventory: 'setterLink',
      invulnerable: 'setter',
      item: 'setterLink',
      jumping: 'getter',
      lifeform: 'getter',
      location: 'setterLink',
      mode: 'setter',
      name: 'setter',
      nbt: 'appender',
      note: 'runner',
      passengers: 'setter',
      player: 'getter',
      remove: 'voider',
      serialize: (thing) => {
         if (_.def(thing)) {
            return {
               format: 'entity',
               lifeform: thing.lifeform,
               location: thing.location,
               nbt: data.nbt
            };
         } else {
            return null;
         }
      },
      silent: 'setter',
      sneaking: 'getter',
      sound: 'voider',
      tags: 'setter',
      text: 'voider',
      uuid: 'getter',
      vector: 'appenderLink',
      velocity: 'appenderLink',
      vitality: 'setter',
      world: 'setter'
   };
};

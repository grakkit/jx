import { _ } from './framework.min.js';
export const enums = _.object(
   _.entries({
      clickType: {
         source: Java.type('org.bukkit.event.inventory.ClickType')
      },
      dragType: {
         source: Java.type('org.bukkit.event.inventory.DragType')
      },
      equipmentSlot: {
         source: Java.type('org.bukkit.inventory.EquipmentSlot')
      },
      inventoryAction: {
         source: Java.type('org.bukkit.event.inventory.InventoryAction')
      },
      icReason: {
         source: Java.type('org.bukkit.event.inventory.InventoryCloseEvent.Reason')
      },
      inventoryType: {
         source: Java.type('org.bukkit.event.inventory.InventoryType')
      },
      itSlotType: {
         source: Java.type('org.bukkit.event.inventory.InventoryType.SlotType')
      },
      ivProperty: {
         source: Java.type('org.bukkit.inventory.InventoryView.Property')
      },
      itemFlag: {
         source: Java.type('org.bukkit.inventory.ItemFlag')
      },
      mainHand: {
         source: Java.type('org.bukkit.inventory.MainHand')
      },
      attribute: {
         source: Java.type('org.bukkit.attribute.Attribute')
      },
      amOperation: {
         source: Java.type('org.bukkit.attribute.AttributeModifier.Operation')
      },
      bmGeneration: {
         source: Java.type('org.bukkit.inventory.meta.BookMeta.Generation')
      },
      ceAction: {
         source: Java.type('net.md_5.bungee.api.chat.ClickEvent.Action')
      },
      chatColor: {
         source: Java.type('net.md_5.bungee.api.ChatColor')
      },
      enchantment: {
         source: Java.type('org.bukkit.enchantments.Enchantment'),
         consumer: (value) => value.key.key
      },
      enchantmentTarget: {
         source: Java.type('org.bukkit.enchantments.EnchantmentTarget')
      },
      heAction: {
         source: Java.type('net.md_5.bungee.api.chat.HoverEvent.Action')
      },
      material: {
         source: Java.type('org.bukkit.Material'),
         consumer: (value) => (value.legacy ? undefined : value.key.key)
      }
   }),
   (entry) => {
      return {
         [entry.key]: _.object([ ...entry.value.source.values() ], (value) => {
            const consumer = entry.value.consumer || ((value) => value.name().toLowerCase());
            return { [consumer(core.access(value))]: value };
         })
      };
   }
);

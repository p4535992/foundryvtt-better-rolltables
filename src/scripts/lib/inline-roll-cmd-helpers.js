import Logger from "./Logger";

/**
 * @href https://github.com/xaukael/inline-chats/blob/main/module.js
 * @href https://github.com/kaelad02/inline-roll-cmd/blob/main/src/inline-roll-cmd.js
 * @href https://github.com/spaceman023/Inline-Table-Rolls/blob/main/scripts/inline-tables.js
 */
export default class InlineRollCommandHelpers {
    static initialize() {
        // example: [[/roll formula]]
        CONFIG.TextEditor.enrichers.push({
            pattern: /\[\[\/(r|roll|pr|publicroll|gmr|gmroll|br|broll|blindroll|sr|selfroll) (\w+)\]\](?:{([^}]+)})?/gi,
            enricher: InlineRollCommandHelpers.createRoll,
        });

        // example: [[/rollSkill ath]]
        CONFIG.TextEditor.enrichers.push({
            pattern:
                /\[\[\/(r|roll|pr|publicroll|gmr|gmroll|br|broll|blindroll|sr|selfroll)Skill (\w+)\]\](?:{([^}]+)})?/gi,
            enricher: InlineRollCommandHelpers.createSkill,
        });

        // example: [[/rollAbility str]]
        CONFIG.TextEditor.enrichers.push({
            pattern:
                /\[\[\/(r|roll|pr|publicroll|gmr|gmroll|br|broll|blindroll|sr|selfroll)Ability (\w+)\]\](?:{([^}]+)})?/gi,
            enricher: InlineRollCommandHelpers.createAbility,
        });

        // example: [[/rollSave dex]]
        CONFIG.TextEditor.enrichers.push({
            pattern:
                /\[\[\/(r|roll|pr|publicroll|gmr|gmroll|br|broll|blindroll|sr|selfroll)Save (\w+)\]\](?:{([^}]+)})?/gi,
            enricher: InlineRollCommandHelpers.createSave,
        });

        // example: [[/rollItem Dagger]]
        CONFIG.TextEditor.enrichers.push({
            pattern: /\[\[\/rollItem ([^\]]+)\]\](?:{([^}]+)})?/gi,
            enricher: InlineRollCommandHelpers.createItem,
        });

        // activate listeners
        const body = $("body");
        body.on("click", "a.brt-inline-roll-cmd", InlineRollCommandHelpers.onClick);
    }

    static createRoll(match, options) {
        Logger.debug("", "createRoll, match:", match);

        const mode = InlineRollCommandHelpers._getRollMode(match[1]);
        const formula = match[2];
        const flavor = match[3];
        const ability = CONFIG.DND5E.abilities[formula] ?? "";
        const title = formula;
        Logger.debug("", "mode", mode, "formula", formula);

        return InlineRollCommandHelpers.createButton(mode, "roll", { formula: formula }, flavor, title);
    }

    /**
     * The rollSkill text enricher that creates a deferred inline roll button.
     * @param {RegExpMatchArray} match the pattern match for this enricher
     * @param {EnrichmentOptions} options the options passed to the enrich function
     * @returns {Promise<HTMLElement>} the deferred inline roll button
     */
    static createSkill(match, options) {
        Logger.debug("", "createSkill, match:", match);

        const mode = InlineRollCommandHelpers._getRollMode(match[1]);
        const skillId = match[2];
        const flavor = match[3];
        const skill = CONFIG.DND5E.skills[skillId]?.label ?? skillId;
        const title = game.i18n.format("DND5E.SkillPromptTitle", { skill });
        Logger.debug("", "mode", mode, "skillId", skillId);

        return InlineRollCommandHelpers.createButton(mode, "skill", { skillId }, flavor, title);
    }

    static createAbility(match, options) {
        Logger.debug("", "createAbility, match:", match);

        const mode = InlineRollCommandHelpers._getRollMode(match[1]);
        const abilityId = match[2];
        const flavor = match[3];
        const ability = CONFIG.DND5E.abilities[abilityId] ?? "";
        const title = game.i18n.format("DND5E.AbilityPromptTitle", { ability });
        Logger.debug("", "mode", mode, "abilityId", abilityId);

        return InlineRollCommandHelpers.createButton(mode, "abilityCheck", { abilityId }, flavor, title);
    }

    static createSave(match, options) {
        Logger.debug("", "createSave, match:", match);

        const mode = InlineRollCommandHelpers._getRollMode(match[1]);
        const abilityId = match[2];
        const flavor = match[3];
        const ability = CONFIG.DND5E.abilities[abilityId] ?? "";
        const title = game.i18n.format("DND5E.SavePromptTitle", { ability });
        Logger.debug("", "mode", mode, "abilityId", abilityId);

        return InlineRollCommandHelpers.createButton(mode, "save", { abilityId }, flavor, title);
    }

    static createItem(match, options) {
        Logger.debug("", "createItem, (match, options):", match, options);

        const itemName = match[1];
        const flavor = match[2];

        let img;
        if (options?.relativeTo?.actor) {
            // find the image from the relativeTo option
            const actor = options.relativeTo.actor;
            const item = actor.items.getName(itemName);
            if (item) img = item.img;
        } else if (game.user.character) {
            // find the image from the assigned character
            const actor = game.user.character;
            const item = actor.items.getName(itemName);
            if (item) img = item.img;
        }

        return img
            ? InlineRollCommandHelpers.createItemButton(itemName, flavor, img)
            : InlineRollCommandHelpers.createButton("roll", "item", { itemName }, flavor, itemName);
    }

    /**
     * Normalize the roll mode found by the pattern.
     * @param {String} mode the mode found by the pattern
     * @returns the corresponding value from `CONST.DICE_ROLL_MODES`
     */
    static _getRollMode(mode) {
        switch (mode) {
            case "r":
            case "roll":
                return "roll";
            case "pr":
            case "publicroll":
                return "publicroll";
            case "gmr":
            case "gmroll":
                return "gmroll";
            case "br":
            case "broll":
            case "blindroll":
                return "blindroll";
            case "sr":
            case "selfroll":
                return "selfroll";
        }
    }

    static createButton(mode, func, commandArgs, flavor, title) {
        const a = document.createElement("a");
        // add classes
        a.classList.add("brt-inline-roll-cmd");
        a.classList.add(mode);
        // add dataset
        a.dataset.mode = mode;
        a.dataset.func = func;
        a.dataset.flavor = flavor ?? "";
        for (const [k, v] of Object.entries(commandArgs)) {
            a.dataset[k] = v;
        }
        // the text inside
        a.innerHTML = `<i class="fas fa-dice-d20"></i>${flavor ?? title}`;
        return a;
    }

    static createItemButton(itemName, flavor, img) {
        const a = document.createElement("a");
        // add classes
        a.classList.add("brt-inline-roll-cmd");
        a.classList.add("roll");
        // add dataset
        a.dataset.mode = "roll";
        a.dataset.func = "item";
        a.dataset.itemName = itemName;
        // the text inside
        a.innerHTML = `<i class="item-image" style="background-image: url('${img}')""></i>${flavor ?? itemName}`;
        return a;
    }

    /**
     * Listener for the deferred inline roll buttons.
     * @param {Event} event the browser event that triggered this listener
     */
    static async onClick(event) {
        event.preventDefault();
        const a = event.currentTarget;

        // Get the tokens to roll with (like the Saving Throw button)
        const tokens = dnd5e.documents.Item5e._getChatCardTargets();
        // get the rollMode, leave undefined for roll so the chat log setting is used
        const rollMode = a.dataset.mode === "roll" ? undefined : a.dataset.mode;

        const flavor = a.dataset.flavor;

        switch (a.dataset.func) {
            case "skill":
                for (const token of tokens) {
                    const speaker = ChatMessage.getSpeaker({ scene: canvas.scene, token: token.document });
                    await token.actor.rollSkill(a.dataset.skillId, { event, flavor, rollMode, speaker });
                }
                break;
            case "abilityCheck":
                for (const token of tokens) {
                    const speaker = ChatMessage.getSpeaker({ scene: canvas.scene, token: token.document });
                    await token.actor.rollAbilityTest(a.dataset.abilityId, {
                        event,
                        flavor,
                        rollMode,
                        speaker,
                    });
                }
                break;
            case "save":
                for (const token of tokens) {
                    const speaker = ChatMessage.getSpeaker({ scene: canvas.scene, token: token.document });
                    await token.actor.rollAbilitySave(a.dataset.abilityId, {
                        event,
                        flavor,
                        rollMode,
                        speaker,
                    });
                }
                break;
            case "item":
                dnd5e.documents.macro.rollItem(a.dataset.itemName);
                break;
        }
    }
}

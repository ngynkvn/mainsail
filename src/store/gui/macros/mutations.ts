import {getDefaultState} from './index'
import {MutationTree} from 'vuex'
import Vue from 'vue'
import {GuiMacrosState, GuiMacrosStateMacrogroupMacro} from '@/store/gui/macros/types'

export const mutations: MutationTree<GuiMacrosState> = {
    reset(state) {
        Object.assign(state, getDefaultState())
    },

    initStore(state, payload) {
        Vue.set(state, 'macrogroups', payload.value)
    },

    saveSetting(state, payload) {
        // eslint-disable-next-line
        const deepSet = (obj:any, is:string[] | string, value:any):any => {
            if (is !== undefined && typeof is === 'string')
                return deepSet(obj,is.split('.'), value)
            else if (is.length==1 && value !== undefined)
                return obj[is[0]] = value
            else if (is.length==0)
                return obj
            else
            if (!(is[0] in obj)) obj[is[0]] = {}
            return deepSet(obj[is[0]],is.slice(1), value)
        }

        deepSet(state, payload.name, payload.value)
    },

    groupStore(state, payload) {
        Vue.set(state.macrogroups, payload.id, payload.values)
    },

    groupUpdate(state, payload) {
        if (payload.id in state.macrogroups) {
            const preset = {...state.macrogroups[payload.id]}
            Object.assign(preset, payload.values)

            Vue.set(state.macrogroups, payload.id, preset)
        }
    },

    addMacroToMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]

        const newMacro: GuiMacrosStateMacrogroupMacro = {
            pos: 1,
            name: payload.macro,
            color: 'group',
            showInStandby: true,
            showInPrinting: true,
            showInPause: true
        }

        if (macros.length) newMacro.pos = Math.max(...macros.map((m: GuiMacrosStateMacrogroupMacro) => m.pos)) + 1
        macros.push(newMacro)

        Vue.set(state.macrogroups[payload.id], 'macros', macros)
    },

    updateMacroFromMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]
        const updateMacroIndex = macros.findIndex((m: GuiMacrosStateMacrogroupMacro) => m.name === payload.macro)
        if (updateMacroIndex !== -1) {
            const macro = macros[updateMacroIndex]
            // @ts-ignore
            macro[payload.option] = payload.value
            Vue.set(state.macrogroups[payload.id], 'macros', macros)
        }
    },

    removeMacroFromMacrogroup(state, payload) {
        const macros = [...state.macrogroups[payload.id]?.macros ?? []]
        const deletedMacroIndex = macros.findIndex((m: GuiMacrosStateMacrogroupMacro) => m.name === payload.macro)
        if (deletedMacroIndex !== -1) {
            const oldPos = macros[deletedMacroIndex].pos
            macros.splice(deletedMacroIndex, 1)

            macros.filter((macro: GuiMacrosStateMacrogroupMacro) => macro.pos > oldPos).forEach((macro: GuiMacrosStateMacrogroupMacro) => {
                macro.pos = macro.pos - 1
            })
        }

        Vue.set(state.macrogroups[payload.id], 'macros', macros)
    },

    groupDelete(state, payload) {
        if (payload in state.macrogroups) {
            Vue.delete(state.macrogroups, payload)
        }
    },
}
<template>
  <div class="pref-spellchecker">
    <h4>{{ $t('preferences.spelling._title') }}</h4>
    <bool
      :description="$t('preferences.spelling.spellcheckerEnabled')"
      :bool="spellcheckerEnabled"
      :onChange="handleSpellcheckerEnabled"
    ></bool>
    <separator></separator>
    <bool
      :description="$t('preferences.spelling.spellcheckerIsHunspell')"
      :bool="spellcheckerIsHunspell"
      :disable="!isOsSpellcheckerSupported || !spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerIsHunspell', value)"
    ></bool>
    <bool
      :description="$t('preferences.spelling.spellcheckerNoUnderline')"
      :bool="spellcheckerNoUnderline"
      :disable="!spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerNoUnderline', value)"
    ></bool>
    <bool
      v-show="isOsx && !spellcheckerIsHunspell"
      :description="$t('preferences.spelling.spellcheckerAutoDetectLanguage')"
      :bool="spellcheckerAutoDetectLanguage"
      :disable="!spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerAutoDetectLanguage', value)"
    ></bool>
    <separator></separator>
    <cur-select
      :description="$t('preferences.spelling.spellcheckerLanguage')"
      :value="spellcheckerLanguage"
      :options="availableDictionaries"
      :disable="!spellcheckerEnabled"
      :onChange="value => onSelectChange('spellcheckerLanguage', value)"
    ></cur-select>
    <div
      v-if="isOsx && !isHunspellSelected && spellcheckerEnabled"
      class="description"
    >
      {{ $t('preferences.spelling.hintMacOS') }}
    </div>
    <div
      v-if="isWindows && !isHunspellSelected && spellcheckerEnabled"
      class="description"
    >
      {{ $t('preferences.spelling.hintWindows') }}
    </div>
    <div v-if="isHunspellSelected && spellcheckerEnabled">
      <div class="description">{{ $t('preferences.spelling.installDictsActions._title') }}</div>
      <el-table
        :data="wordsInCustomDictionary"
        empty-text="No words available"
        style="width: 100%"
      >
        <el-table-column prop="word" label="Word">
        </el-table-column>

        <el-table-column fixed="right" label="Options" width="90">
          <template slot-scope="scope">
            <el-button @click="handleUpdateClick(scope.$index, scope.row)" type="text" size="small">{{ $t('preferences.spelling.installDictsActions.update') }}</el-button>
            <el-button @click="handleDeleteClick(scope.$index, scope.row)" type="text" size="small">{{ $t('preferences.spelling.installDictsActions.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="description">{{ $t('preferences.spelling.downloadDict') }}</div>
      <div class="dictionary-group">
        <el-select
          v-model="selectedDictionaryToAdd"
        >
          <el-option
            v-for="item in dictionariesLanguagesOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button icon="el-icon-document-add" @click="addNewDict"></el-button>
      </div>
      <div v-if="errorMessage" class="description">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import log from 'electron-log'
import { mapState } from 'vuex'
import Compound from '../common/compound'
import CurSelect from '../common/select'
import Bool from '../common/bool'
import Separator from '../common/separator'
import { isOsx } from '@/util'
import { SpellChecker } from '@/spellchecker'
import { getLanguageName } from '@/spellchecker/languageMap'
import notice from '@/services/notification'

export default {
  components: {
    Bool,
    Compound,
    CurSelect,
    Separator
  },
  data () {
    this.isOsx = isOsx
    return {
      availableDictionaries: [],
      wordsInCustomDictionary: [],
      errorMessage: ''
    }
  },
  computed: {
    ...mapState({
      spellcheckerEnabled: state => state.preferences.spellcheckerEnabled,
      spellcheckerNoUnderline: state => state.preferences.spellcheckerNoUnderline,
      spellcheckerLanguage: state => state.preferences.spellcheckerLanguage
    })
  },
  mounted () {
    if (!isOsx) {
      this.getAvailableDictionaries()
        .then(dicts => {
          this.availableDictionaries = dicts
        })

      ipcRenderer.invoke('mt::spellchecker-get-custom-dictionary-words')
        .then(words => {
          this.wordsInCustomDictionary = words.map(word => { return { word } })
        })
    }
  },
  methods: {
    async getAvailableDictionaries () {
      const dictionaries = await SpellChecker.getAvailableDictionaries()
      return dictionaries.map(selectedItem => {
        return {
          value: selectedItem,
          label: getLanguageName(selectedItem)
        }
      })
    },
    async ensureDictLanguage (lang) {
      if (!this.spellchecker) {
        this.spellchecker = new SpellChecker(true, 'en-US')
      }
      await this.spellchecker.switchLanguage(lang)
    },

    handleSpellcheckerLanguage (languageCode) {
      this.ensureDictLanguage(languageCode)
        .then(() => {
          this.onSelectChange('spellcheckerLanguage', languageCode)
        })
        .catch(error => {
          log.error(error)
          notice.notify({
            title: 'Failed to switch language',
            type: 'error',
            message: error.message
          })
        })
    },
    handleSpellcheckerEnabled (isEnabled) {
      this.onSelectChange('spellcheckerEnabled', isEnabled)
    },
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    },
    handleDeleteClick (selectedItem) {
      if (selectedItem && typeof selectedItem.word === 'string') {
        ipcRenderer.invoke('mt::spellchecker-remove-word', selectedItem.word)
          .then(success => {
            if (success) {
              this.wordsInCustomDictionary = this.wordsInCustomDictionary.filter(item => item.word !== selectedItem.word)
            } else {
              notice.notify({
                title: 'Failed to remove custom word',
                type: 'error',
                message: 'An unexpected error occurred while saving.'
              })
            }
          })
          .catch(error => log.error(error))
      }
    }
  }
}
</script>

<style scoped>
  .pref-spellchecker {
    & div.description {
      margin-top: 10px;
      margin-bottom: 2px;
      color: var(--iconColor);
      font-size: 14px;
    }
    & h6.title {
      font-weight: 400;
      font-size: 1.1em;
      margin-bottom: 0;
    }
  }
  .el-table, .el-table__expanded-cell {
    background: var(--editorBgColor);
  }
  .el-table button {
    padding: 1px 2px;
    margin: 5px 10px;
    color: var(--themeColor);
    background: none;
    border: none;
  }
  .el-table button:hover,
  .el-table button:active {
    opacity: 0.9;
    background: none;
    border: none;
  }
</style>
<style>
  .pref-spellchecker .el-table table {
    margin: 0;
    border: none;
  }
  .pref-spellchecker .el-table th,
  .pref-spellchecker .el-table tr {
    background: var(--editorBgColor);
  }
  .pref-spellchecker .el-table th.el-table__cell.is-leaf,
  .pref-spellchecker .el-table th,
  .pref-spellchecker .el-table td {
    border: none;
  }
  .pref-spellchecker .el-table th.el-table__cell.is-leaf:last-child,
  .pref-spellchecker .el-table th:last-child,
  .pref-spellchecker .el-table td:last-child {
    border-right: 1px solid var(--tableBorderColor);
  }
  .pref-spellchecker .el-table--border::after,
  .pref-spellchecker .el-table--group::after,
  .pref-spellchecker .el-table::before,
  .pref-spellchecker .el-table__fixed-right::before,
  .pref-spellchecker .el-table__fixed::before {
    background: var(--tableBorderColor);
  }
  .pref-spellchecker .el-table__body tr.hover-row.current-row>td,
  .pref-spellchecker .el-table__body tr.hover-row.el-table__row--striped.current-row>td,
  .pref-spellchecker .el-table__body tr.hover-row.el-table__row--striped>td,
  .pref-spellchecker .el-table__body tr.hover-row>td {
    background: var(--selectionColor);
  }
  .pref-spellchecker .el-table .el-table__cell {
    padding: 2px 0;
    margin: 4px 6px;
  }

  .pref-spellchecker li.el-select-dropdown__item {
    color: var(--editorColor);
    height: 30px;
  }
  .pref-spellchecker li.el-select-dropdown__item.hover, li.el-select-dropdown__item:hover {
    background: var(--floatHoverColor);
  }
  .pref-spellchecker div.el-select-dropdown {
    background: var(--floatBgColor);
    border-color: var(--floatBorderColor);
    & .popper__arrow {
      display: none;
    }
  }
  .pref-spellchecker input.el-input__inner {
    height: 30px;
    background: transparent;
    color: var(--editorColor);
    border-color: var(--editorColor10);
  }
  .pref-spellchecker .el-input__icon,
  .pref-spellchecker .el-input__inner {
    line-height: 30px;
  }
</style>

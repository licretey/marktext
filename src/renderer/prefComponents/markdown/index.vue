<template>
  <div class="pref-markdown">
    <h4>markdown</h4>
    <bool
      :description="$t('preferences.markdown.preferLooseListItem')"
      :bool="preferLooseListItem"
      :onChange="value => onSelectChange('preferLooseListItem', value)"
      more="https://spec.commonmark.org/0.29/#loose"
    ></bool>
    <cus-select
      :description="$t('preferences.markdown.bulletListMarker')"
      :value="bulletListMarker"
      :options="bulletListMarkerOptions()"
      :onChange="value => onSelectChange('bulletListMarker', value)"
      more="https://spec.commonmark.org/0.29/#bullet-list-marker"
    ></cus-select>
    <cus-select
      :description="$t('preferences.markdown.orderListDelimiter')"
      :value="orderListDelimiter"
      :options="orderListDelimiterOptions()"
      :onChange="value => onSelectChange('orderListDelimiter', value)"
      more="https://spec.commonmark.org/0.29/#ordered-list"
    ></cus-select>
    <cus-select
      :description="$t('preferences.markdown.preferHeadingStyle._title')"
      :value="preferHeadingStyle"
      :options="preferHeadingStyleOptions()"
      :onChange="value => onSelectChange('preferHeadingStyle', value)"
      :disable="true"
    ></cus-select>
    <cus-select
      :description="$t('preferences.markdown.tabSize')"
      :value="tabSize"
      :options="tabSizeOptions()"
      :onChange="value => onSelectChange('tabSize', value)"
    ></cus-select>
    <cus-select
      :description="$t('preferences.markdown.listIndentation._title')"
      :value="listIndentation"
      :options="listIndentationOptions()"
      :onChange="value => onSelectChange('listIndentation', value)"
    ></cus-select>
    <separator></separator>
    <h5>{{ $t('preferences.markdown.extentions') }}</h5>
    <cus-select
      :description="$t('preferences.markdown.frontmatterType')"
      :value="frontmatterType"
      :options="frontmatterTypeOptions()"
      :onChange="value => onSelectChange('frontmatterType', value)"
    ></cus-select>
    <bool
      :description="$t('preferences.markdown.superSubScript')"
      :bool="superSubScript"
      :onChange="value => onSelectChange('superSubScript', value)"
      more="https://pandoc.org/MANUAL.html#superscripts-and-subscripts"
    ></bool>
    <bool
      :description="$t('preferences.markdown.footnote')"
      :bool="footnote"
      :onChange="value => onSelectChange('footnote', value)"
      more="https://pandoc.org/MANUAL.html#footnotes"
    ></bool>
    <bool
      description="Use Pandoc-style citations (requires restart)"
      :bool="citations"
      :onChange="value => onSelectChange('citations', value)"
      more="https://pandoc.org/MANUAL.html#citations"
    ></bool>
    <bool
      description="Render pandoc citations as links"
      :bool="citationLinks"
      :onChange="value => onSelectChange('citationLinks', value)"
      more="https://pandoc.org/MANUAL.html#citations"
    ></bool>
    <text-box
      description="Template for citation links"
      :input="citationLinkTemplate"
      :emitTime="0"
      :onChange="value => onSelectChange('citationLinkTemplate', value)"
    ></text-box>
    <separator></separator>
    <h5>{{ $t('preferences.markdown.compatibility') }}</h5>
    <bool
      :description="$t('preferences.markdown.isHtmlEnabled')"
      :bool="isHtmlEnabled"
      :onChange="value => onSelectChange('isHtmlEnabled', value)"
    ></bool>
    <bool
      :description="$t('preferences.markdown.isGitlabCompatibilityEnabled')"
      :bool="isGitlabCompatibilityEnabled"
      :onChange="value => onSelectChange('isGitlabCompatibilityEnabled', value)"
    ></bool>
    <separator></separator>
    <h5>{{ $t('preferences.markdown.diagramTheme') }}</h5>
    <cus-select
      :description="$t('preferences.markdown.sequenceTheme._title')"
      :value="sequenceTheme"
      :options="sequenceThemeOptions()"
      :onChange="value => onSelectChange('sequenceTheme', value)"
      more="https://bramp.github.io/js-sequence-diagrams/"
    ></cus-select>
  </div>
</template>

<script>
import Compound from '../common/compound'
import Separator from '../common/separator'
import { mapState } from 'vuex'
import Bool from '../common/bool'
import CusSelect from '../common/select'
import TextBox from '../common/textBox'
import {
  bulletListMarkerOptions,
  orderListDelimiterOptions,
  preferHeadingStyleOptions,
  listIndentationOptions,
  frontmatterTypeOptions,
  sequenceThemeOptions
} from './config'

export default {
  components: {
    Compound,
    Separator,
    Bool,
    CusSelect,
    TextBox
  },
  data () {
    this.bulletListMarkerOptions = bulletListMarkerOptions
    this.orderListDelimiterOptions = orderListDelimiterOptions
    this.preferHeadingStyleOptions = preferHeadingStyleOptions
    this.listIndentationOptions = listIndentationOptions
    this.frontmatterTypeOptions = frontmatterTypeOptions
    this.sequenceThemeOptions = sequenceThemeOptions
    return {}
  },
  computed: {
    ...mapState({
      preferLooseListItem: state => state.preferences.preferLooseListItem,
      bulletListMarker: state => state.preferences.bulletListMarker,
      orderListDelimiter: state => state.preferences.orderListDelimiter,
      preferHeadingStyle: state => state.preferences.preferHeadingStyle,
      listIndentation: state => state.preferences.listIndentation,
      frontmatterType: state => state.preferences.frontmatterType,
      superSubScript: state => state.preferences.superSubScript,
      footnote: state => state.preferences.footnote,
      isHtmlEnabled: state => state.preferences.isHtmlEnabled,
      citations: state => state.preferences.citations,
      citationLinks: state => state.preferences.citationLinks,
      citationLinkTemplate: state => state.preferences.citationLinkTemplate,
      isGitlabCompatibilityEnabled: state => state.preferences.isGitlabCompatibilityEnabled,
      sequenceTheme: state => state.preferences.sequenceTheme
    })
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style scoped>
  .pref-markdown {
  }
</style>

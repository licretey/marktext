<template>
  <div class="pref-image">
    <h4>{{ $t('preferences.image._title') }}</h4>
    <section class="image-ctrl">
      <div>{{ $t('preferences.image.imageInsertAction._title') }}
        <el-tooltip class='item' effect='dark' :content="$t('preferences.image.imageInsertAction._notice')" placement='top-start'>
          <i class="el-icon-info"></i>
        </el-tooltip>
      </div>
      <el-radio-group v-model="imageInsertAction">
        <el-radio label="upload">{{ $t('preferences.image.imageInsertAction.upload') }}</el-radio>
        <el-radio label="folder">{{ $t('preferences.image.imageInsertAction.folder') }}</el-radio>
        <el-radio label="path">{{ $t('preferences.image.imageInsertAction.path') }}</el-radio>
      </el-radio-group>
    </section>
    <separator></separator>
    <section class="image-folder">
      <div class="description">{{ $t('preferences.image.localImageFolderAction._title') }}</div>
      <div class="path">{{imageFolderPath}}</div>
      <div>
        <el-button size="mini" @click="modifyImageFolderPath">{{ $t('preferences.image.localImageFolderAction.modify') }}</el-button>
        <el-button size="mini" @click="openImageFolder">{{ $t('preferences.image.localImageFolderAction.open') }}</el-button>
      </div>
      <bool
        :description="$t('preferences.image.imagePreferRelativeDirectory')"
        more="https://github.com/marktext/marktext/blob/develop/docs/IMAGES.md"
        :bool="imagePreferRelativeDirectory"
        :onChange="value => onSelectChange('imagePreferRelativeDirectory', value)"
      ></bool>
      <text-box
        :description="$t('preferences.image.imageRelativeDirectoryName')"
        :input="imageRelativeDirectoryName"
        :regexValidator="/^(?:$|(?![a-zA-Z]:)[^\/\\].*$)/"
        :defaultValue="relativeDirectoryNamePlaceholder"
        :onChange="value => onSelectChange('imageRelativeDirectoryName', value)"
      ></text-box>
    </section>
    <Separator />
    <ServerPathSetting v-if="imageInsertAction === 'folder' || imageInsertAction === 'path'" />
    <Separator />
    <FolderSetting v-if="imageInsertAction === 'folder' || imageInsertAction === 'path'" />
    <Uploader v-if="imageInsertAction === 'upload'" />
  </div>
</template>

<script>
import Separator from '../common/separator'
import Uploader from './components/uploader'
import CurSelect from '@/prefComponents/common/select'
import FolderSetting from './components/folderSetting'
import ServerPathSetting from './components/serverPathSetting'
import { imageActions } from './config'

export default {
  components: {
    Separator,
    CurSelect,
    ServerPathSetting,
    FolderSetting,
    Uploader
  },
  data () {
    this.imageActions = imageActions

    return {}
  },
  computed: {
    imageInsertAction: {
      get: function () {
        return this.$store.state.preferences.imageInsertAction
      }
    }
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style>
.pref-image {
  & .image-ctrl {
    font-size: 14px;
    margin: 20px 0;
    color: var(--editorColor);
    & label {
      display: block;
      margin: 20px 0;
    }
  }
}
</style>

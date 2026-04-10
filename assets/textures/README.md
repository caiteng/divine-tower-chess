# 贴图导入说明

默认贴图生成在：

```text
assets/resources/textures
```

`resources` 目录里的贴图可以被 `CocosGameController` 自动加载。

如果你想换自己的 PNG，可以直接替换同名文件，等待 Cocos Creator 自动导入并生成 `.meta`。

建议先准备这些文件：

- `assets/resources/textures/board.png`：棋盘背景，推荐 720x260
- `assets/resources/textures/tile.png`：格子底图，推荐 64x64
- `assets/resources/textures/unit.png`：通用棋子图标，推荐 128x128
- `assets/resources/textures/enemy.png`：通用敌人图标，推荐 64x64
- `assets/resources/textures/crystal.png`：水晶图标，推荐 128x256

组件会自动加载这些默认贴图。

也可以在场景里选中挂有 `CocosGameController` 的 Canvas，然后把对应图片的 `SpriteFrame` 手动拖到组件属性：

- `Board Sprite`
- `Tile Sprite`
- `Unit Sprite`
- `Enemy Sprite`
- `Crystal Sprite`

如果某个槽位为空，游戏会自动使用当前的纯色 Graphics 占位图形。

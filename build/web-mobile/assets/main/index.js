System.register("chunks:///_virtual/unit-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './id.ts'], function (exports) {
  'use strict';

  var _createForOfIteratorHelperLoose, _defineProperty, cclegacy, UNIT_CONFIG, nextId;

  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      nextId = module.nextId;
    }],
    execute: function () {
      cclegacy._RF.push({}, "085affZmYVE9Y5cvh4G49FY", "unit-system", undefined);

      var UnitSystem = exports('UnitSystem', /*#__PURE__*/function () {
        function UnitSystem() {
          _defineProperty(this, "bench", []);

          _defineProperty(this, "placed", []);

          _defineProperty(this, "lanes", [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5]]);
        }

        var _proto = UnitSystem.prototype;

        _proto.addToBench = function addToBench(unitId) {
          var instance = {
            instanceId: nextId('unit'),
            unitId: unitId,
            star: 1
          };
          this.bench.push(instance);
          this.tryMerge(unitId, 1);
          return instance;
        };

        _proto.tryMerge = function tryMerge(unitId, star) {
          var candidates = this.getMergeCandidates(unitId, star);

          if (candidates.length < 3) {
            return;
          }

          var selected = candidates.slice(0, 3);
          var keep = selected[0];
          var consumedIds = selected.slice(1).map(function (candidate) {
            return candidate.unit.instanceId;
          });
          var nextStar = star + 1;
          this.bench = this.bench.filter(function (u) {
            return !consumedIds.includes(u.instanceId);
          });
          this.placed = this.placed.filter(function (u) {
            return !consumedIds.includes(u.instanceId);
          });
          keep.unit.star = nextStar;

          if (keep.source === 'placed') {
            keep.unit.currentHp = UNIT_CONFIG[keep.unit.unitId].maxHp;
            keep.unit.cooldownLeft = 0;
          }

          if (star === 1) {
            this.tryMerge(unitId, 2);
          }
        };

        _proto.getMergeCandidates = function getMergeCandidates(unitId, star) {
          var placed = this.placed.filter(function (u) {
            return u.unitId === unitId && u.star === star && !u.assignedTaskId;
          }).map(function (unit) {
            return {
              source: 'placed',
              unit: unit
            };
          });
          var bench = this.bench.filter(function (u) {
            return u.unitId === unitId && u.star === star && !u.assignedTaskId;
          }).map(function (unit) {
            return {
              source: 'bench',
              unit: unit
            };
          });
          return [].concat(placed, bench);
        };

        _proto.placeFromBench = function placeFromBench(instanceId, lane, tileIndex) {
          var laneTiles = this.lanes[lane];

          if (!laneTiles || !laneTiles.includes(tileIndex)) {
            return false;
          }

          var occupied = this.placed.some(function (u) {
            return u.lane === lane && u.tileIndex === tileIndex;
          });

          if (occupied) {
            return false;
          }

          var benchUnit = this.bench.find(function (u) {
            return u.instanceId === instanceId;
          });

          if (!benchUnit) {
            return false;
          }

          this.bench = this.bench.filter(function (u) {
            return u.instanceId !== instanceId;
          });
          var config = UNIT_CONFIG[benchUnit.unitId];
          this.placed.push({
            instanceId: benchUnit.instanceId,
            unitId: benchUnit.unitId,
            star: benchUnit.star,
            lane: lane,
            tileIndex: tileIndex,
            cooldownLeft: 0,
            currentHp: config.maxHp,
            assignedTaskId: benchUnit.assignedTaskId
          });
          return true;
        };

        _proto.movePlacedUnit = function movePlacedUnit(instanceId, lane, tileIndex) {
          var laneTiles = this.lanes[lane];

          if (!laneTiles || !laneTiles.includes(tileIndex)) {
            return false;
          }

          var unit = this.placed.find(function (u) {
            return u.instanceId === instanceId;
          });

          if (!unit) {
            return false;
          }

          var occupied = this.placed.some(function (u) {
            return u.instanceId !== instanceId && u.lane === lane && u.tileIndex === tileIndex;
          });

          if (occupied) {
            return false;
          }

          unit.lane = lane;
          unit.tileIndex = tileIndex;
          return true;
        };

        _proto.resetDefeatedPlacedUnits = function resetDefeatedPlacedUnits() {
          var resetCount = 0;

          for (var _iterator = _createForOfIteratorHelperLoose(this.placed), _step; !(_step = _iterator()).done;) {
            var unit = _step.value;

            if (unit.currentHp > 0) {
              continue;
            }

            unit.currentHp = UNIT_CONFIG[unit.unitId].maxHp;
            unit.cooldownLeft = 0;
            resetCount += 1;
          }

          return resetCount;
        };

        _proto.getBenchUnits = function getBenchUnits() {
          return [].concat(this.bench);
        };

        _proto.getPlacedUnits = function getPlacedUnits() {
          return [].concat(this.placed);
        };

        _proto.getUnitsForTaskRoll = function getUnitsForTaskRoll() {
          return [].concat(this.bench, this.placed).map(function (u) {
            return {
              instanceId: u.instanceId,
              unitId: u.unitId,
              star: u.star,
              assignedTaskId: u.assignedTaskId
            };
          });
        };

        _proto.setAssignedTask = function setAssignedTask(unitInstanceId, taskId) {
          var benchUnit = this.bench.find(function (u) {
            return u.instanceId === unitInstanceId;
          });

          if (benchUnit) {
            benchUnit.assignedTaskId = taskId;
          }

          var placedUnit = this.placed.find(function (u) {
            return u.instanceId === unitInstanceId;
          });

          if (placedUnit) {
            placedUnit.assignedTaskId = taskId;
          }
        };

        _proto.evolveUnit = function evolveUnit(unitInstanceId, targetUnitId) {
          var apply = function apply(u) {
            u.unitId = targetUnitId;
            u.star = 3;
            u.assignedTaskId = undefined;
          };

          var benchUnit = this.bench.find(function (u) {
            return u.instanceId === unitInstanceId;
          });
          if (benchUnit) apply(benchUnit);
          var placedUnit = this.placed.find(function (u) {
            return u.instanceId === unitInstanceId;
          });
          if (placedUnit) apply(placedUnit);
        };

        return UnitSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/cocos-game-controller.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './difficulty-config.ts', './divine-task-config.ts', './game-controller.ts'], function (exports) {
  'use strict';

  var _applyDecoratedDescriptor, _inheritsLoose, _createForOfIteratorHelperLoose, _initializerDefineProperty, _assertThisInitialized, _defineProperty, cclegacy, _decorator, SpriteFrame, resources, ImageAsset, Node, Layers, Vec3, UITransform, Color, Label, director, Canvas, Camera, Graphics, Button, Sprite, Component, UNIT_CONFIG, DIFFICULTY_CONFIG, DIVINE_TASK_CONFIG, GameController;

  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      SpriteFrame = module.SpriteFrame;
      resources = module.resources;
      ImageAsset = module.ImageAsset;
      Node = module.Node;
      Layers = module.Layers;
      Vec3 = module.Vec3;
      UITransform = module.UITransform;
      Color = module.Color;
      Label = module.Label;
      director = module.director;
      Canvas = module.Canvas;
      Camera = module.Camera;
      Graphics = module.Graphics;
      Button = module.Button;
      Sprite = module.Sprite;
      Component = module.Component;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      DIFFICULTY_CONFIG = module.DIFFICULTY_CONFIG;
    }, function (module) {
      DIVINE_TASK_CONFIG = module.DIVINE_TASK_CONFIG;
    }, function (module) {
      GameController = module.GameController;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _temp;

      cclegacy._RF.push({}, "18f3e3RQAZKFr67vr8QGQD/", "cocos-game-controller", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var CocosGameController = exports('CocosGameController', (_dec = ccclass('CocosGameController'), _dec2 = property(SpriteFrame), _dec3 = property(SpriteFrame), _dec4 = property(SpriteFrame), _dec5 = property(SpriteFrame), _dec6 = property(SpriteFrame), _dec(_class = (_class2 = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CocosGameController, _Component);

        function CocosGameController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_assertThisInitialized(_this), "boardSprite", _descriptor, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "tileSprite", _descriptor2, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "unitSprite", _descriptor3, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "enemySprite", _descriptor4, _assertThisInitialized(_this));

          _initializerDefineProperty(_assertThisInitialized(_this), "crystalSprite", _descriptor5, _assertThisInitialized(_this));

          _defineProperty(_assertThisInitialized(_this), "controller", new GameController());

          _defineProperty(_assertThisInitialized(_this), "uiRoot", null);

          _defineProperty(_assertThisInitialized(_this), "statusLabel", null);

          _defineProperty(_assertThisInitialized(_this), "cocosBoardRoot", null);

          _defineProperty(_assertThisInitialized(_this), "cocosBenchRoot", null);

          _defineProperty(_assertThisInitialized(_this), "domRoot", null);

          _defineProperty(_assertThisInitialized(_this), "domBoard", null);

          _defineProperty(_assertThisInitialized(_this), "domStatus", null);

          _defineProperty(_assertThisInitialized(_this), "htmlDebugVisible", false);

          _defineProperty(_assertThisInitialized(_this), "selectedUnitInstanceId", null);

          _defineProperty(_assertThisInitialized(_this), "selectedUnitSource", null);

          _defineProperty(_assertThisInitialized(_this), "currentScreen", 'home');

          _defineProperty(_assertThisInitialized(_this), "pendingDifficulty", 'beginner');

          _defineProperty(_assertThisInitialized(_this), "volume", 80);

          _defineProperty(_assertThisInitialized(_this), "avatarPulseTime", 0);

          _defineProperty(_assertThisInitialized(_this), "unitAvatarSprites", {});

          _defineProperty(_assertThisInitialized(_this), "speed", 1);

          return _this;
        }

        var _proto = CocosGameController.prototype;

        _proto.onLoad = function onLoad() {
          console.log('[CocosGameController] onLoad');
          this.ensureRuntimeCanvas();
          this.showHomeScreen();
          this.loadDefaultSprites();
        };

        _proto.onDestroy = function onDestroy() {
          this.removeBrowserOverlay();
        };

        _proto.startBeginner = function startBeginner() {
          this.startGame('beginner');
        };

        _proto.startNormal = function startNormal() {
          this.startGame('normal');
        };

        _proto.startHard = function startHard() {
          this.startGame('hard');
        };

        _proto.startGame = function startGame(difficulty) {
          this.selectedUnitInstanceId = null;
          this.selectedUnitSource = null;
          this.currentScreen = 'game';
          this.buildRuntimeUi();
          this.controller.startGame(difficulty);
          this.refreshStatus("\u5F00\u59CB" + DIFFICULTY_CONFIG[difficulty].name + "\u96BE\u5EA6");
        };

        _proto.refreshShop = function refreshShop() {
          this.logAndRefresh('刷新商店', this.controller.refreshShop());
        };

        _proto.buySlot0 = function buySlot0() {
          this.buy(0);
        };

        _proto.buySlot1 = function buySlot1() {
          this.buy(1);
        };

        _proto.buySlot2 = function buySlot2() {
          this.buy(2);
        };

        _proto.buy = function buy(slotIndex) {
          this.logAndRefresh("\u8D2D\u4E70\u5546\u5E97" + (slotIndex + 1), this.controller.buy(slotIndex));
        };

        _proto.buyAll = function buyAll() {
          var bought = 0;

          for (var i = 0; i < 3; i += 1) {
            if (this.controller.buy(0)) {
              bought += 1;
            }
          }

          this.refreshStatus("\u81EA\u52A8\u8D2D\u4E70" + bought + "\u4E2A\u68CB\u5B50");
        };

        _proto.place = function place(instanceId, lane, tileIndex) {
          this.logAndRefresh("\u4E0A\u9635" + instanceId, this.controller.place(instanceId, lane, tileIndex));
        };

        _proto.movePlaced = function movePlaced(instanceId, lane, tileIndex) {
          this.logAndRefresh("\u79FB\u52A8" + instanceId, this.controller.movePlaced(instanceId, lane, tileIndex));
        };

        _proto.autoPlaceBench = function autoPlaceBench() {
          var snapshot = this.controller.snapshot();
          var placedCount = 0;

          for (var _iterator = _createForOfIteratorHelperLoose(snapshot.bench), _step; !(_step = _iterator()).done;) {
            var unit = _step.value;
            var position = this.findFirstOpenTile();

            if (!position) {
              break;
            }

            if (this.controller.place(unit.instanceId, position.lane, position.tileIndex)) {
              placedCount += 1;
            }
          }

          this.refreshStatus("\u81EA\u52A8\u4E0A\u9635" + placedCount + "\u4E2A\u68CB\u5B50");
        };

        _proto.moveFirstPlaced = function moveFirstPlaced() {
          var snapshot = this.controller.snapshot();
          var first = snapshot.placed[0];

          if (!first) {
            this.refreshStatus('没有可移动的上阵棋子');
            return;
          }

          var position = this.findFirstOpenTile(first.instanceId);

          if (!position) {
            this.refreshStatus('没有空位可移动');
            return;
          }

          this.logAndRefresh("\u79FB\u52A8" + first.instanceId, this.controller.movePlaced(first.instanceId, position.lane, position.tileIndex));
        };

        _proto.beginBattle = function beginBattle() {
          this.selectedUnitInstanceId = null;
          this.selectedUnitSource = null;
          this.logAndRefresh('开始战斗', this.controller.beginBattle());
        };

        _proto.toggleSpeed = function toggleSpeed() {
          this.speed = this.speed === 1 ? 3 : 1;
          this.refreshStatus("\u901F\u5EA6 x" + this.speed);
        };

        _proto.toggleHtmlDebug = function toggleHtmlDebug() {
          this.htmlDebugVisible = !this.htmlDebugVisible;

          if (this.htmlDebugVisible) {
            this.buildBrowserOverlay();
          } else {
            this.removeBrowserOverlay();
          }

          this.refreshStatus("HTML\u8C03\u8BD5\u9762\u677F" + (this.htmlDebugVisible ? '开启' : '关闭'));
        };

        _proto.update = function update(dt) {
          if (this.currentScreen !== 'game') {
            return;
          }

          this.avatarPulseTime += dt;
          this.controller.tick(dt * this.speed);
          this.refreshStatus();
        };

        _proto.snapshot = function snapshot() {
          return this.controller.snapshot();
        };

        _proto.loadDefaultSprites = function loadDefaultSprites() {
          var _this2 = this;

          if (!this.boardSprite) {
            this.loadSpriteIfEmpty('textures/board', function (spriteFrame) {
              _this2.boardSprite = spriteFrame;
            });
          }

          if (!this.tileSprite) {
            this.loadSpriteIfEmpty('textures/tile', function (spriteFrame) {
              _this2.tileSprite = spriteFrame;
            });
          }

          if (!this.unitSprite) {
            this.loadSpriteIfEmpty('textures/unit', function (spriteFrame) {
              _this2.unitSprite = spriteFrame;
            });
          }

          if (!this.enemySprite) {
            this.loadSpriteIfEmpty('textures/enemy', function (spriteFrame) {
              _this2.enemySprite = spriteFrame;
            });
          }

          if (!this.crystalSprite) {
            this.loadSpriteIfEmpty('textures/crystal', function (spriteFrame) {
              _this2.crystalSprite = spriteFrame;
            });
          }

          this.loadDefaultUnitAvatars();
        };

        _proto.loadDefaultUnitAvatars = function loadDefaultUnitAvatars() {
          var _this3 = this;

          var avatarPaths = {
            archer: 'textures/avatars/archer',
            paladin: 'textures/avatars/paladin',
            shield_guard: 'textures/avatars/shield_guard',
            warrior: 'textures/avatars/warrior',
            mage: 'textures/avatars/mage',
            priest: 'textures/avatars/priest',
            cavalry: 'textures/avatars/cavalry',
            spearman: 'textures/avatars/spearman',
            berserker: 'textures/avatars/berserker',
            light_mage: 'textures/avatars/light_mage'
          };
          Object.keys(avatarPaths).forEach(function (unitId) {
            _this3.loadSpriteIfEmpty(avatarPaths[unitId], function (spriteFrame) {
              _this3.unitAvatarSprites[unitId] = spriteFrame;
            });
          });
        };

        _proto.loadSpriteIfEmpty = function loadSpriteIfEmpty(path, apply) {
          var _this4 = this;

          resources.load(path, ImageAsset, function (imageErr, imageAsset) {
            if (!imageErr && imageAsset) {
              apply(SpriteFrame.createWithImage(imageAsset));

              _this4.refreshStatus("\u9ED8\u8BA4\u8D34\u56FE\u5DF2\u52A0\u8F7D: " + path);

              return;
            }

            resources.load(path, SpriteFrame, function (spriteErr, spriteFrame) {
              if (!spriteErr && spriteFrame) {
                apply(spriteFrame);

                _this4.refreshStatus("\u9ED8\u8BA4\u8D34\u56FE\u5DF2\u52A0\u8F7D: " + path);

                return;
              }

              resources.load(path + "/spriteFrame", SpriteFrame, function (fallbackErr, fallbackSpriteFrame) {
                if (fallbackErr || !fallbackSpriteFrame) {
                  var _ref;

                  console.warn("[CocosGameController] \u8D34\u56FE\u52A0\u8F7D\u5931\u8D25: " + path, (_ref = imageErr !== null && imageErr !== void 0 ? imageErr : spriteErr) !== null && _ref !== void 0 ? _ref : fallbackErr);

                  _this4.refreshStatus("\u9ED8\u8BA4\u8D34\u56FE\u52A0\u8F7D\u5931\u8D25: " + path);

                  return;
                }

                apply(fallbackSpriteFrame);

                _this4.refreshStatus("\u9ED8\u8BA4\u8D34\u56FE\u5DF2\u52A0\u8F7D: " + path + "/spriteFrame");
              });
            });
          });
        };

        _proto.resetRuntimeRoot = function resetRuntimeRoot() {
          var _this$uiRoot;

          if (this.uiRoot && this.uiRoot.name === 'RuntimeUiRoot') {
            this.uiRoot.removeAllChildren();
            this.statusLabel = null;
            this.cocosBoardRoot = null;
            this.cocosBenchRoot = null;
            return this.uiRoot;
          }

          var parent = (_this$uiRoot = this.uiRoot) !== null && _this$uiRoot !== void 0 ? _this$uiRoot : this.node;
          var root = new Node('RuntimeUiRoot');
          root.layer = Layers.Enum.UI_2D;
          parent.addChild(root);
          root.setPosition(new Vec3(0, 0, 0));
          var rootTransform = root.addComponent(UITransform);
          rootTransform.setContentSize(960, 540);
          this.uiRoot = root;
          return root;
        };

        _proto.showHomeScreen = function showHomeScreen() {
          var _this5 = this;

          this.currentScreen = 'home';
          var root = this.resetRuntimeRoot();
          this.createBackground();
          this.createCocosTextInRoot(root, 'Title', '神塔棋兵', 0, 120, 520, 42, new Color(24, 47, 79, 255));
          this.createCocosTextInRoot(root, 'Subtitle', '守住水晶，合成棋子，完成神品进阶', 0, 76, 520, 16, new Color(71, 85, 105, 255));
          this.createButton('开始', 0, 18, 150, function () {
            return _this5.showMapSelectScreen();
          });
          this.createButton('设置', 0, -30, 150, function () {
            return _this5.showSettingsScreen();
          });
          this.createButton('鸣谢', 0, -78, 150, function () {
            return _this5.showCreditsScreen();
          });
        };

        _proto.showMapSelectScreen = function showMapSelectScreen() {
          var _this6 = this;

          this.currentScreen = 'map';
          var root = this.resetRuntimeRoot();
          this.createBackground();
          this.createButton('返回', -420, 245, 70, function () {
            return _this6.showHomeScreen();
          });
          this.createCocosTextInRoot(root, 'MapTitle', '选择地图', 0, 210, 360, 26, new Color(24, 47, 79, 255));
          this.createCocosRectInRoot(root, 'MapCard', 0, 50, 520, 230, new Color(215, 226, 236, 255));
          this.createCocosTextInRoot(root, 'MapCardTitle', '当前地图', 0, 115, 240, 24, new Color(17, 24, 39, 255));
          this.createCocosTextInRoot(root, 'MapCardInfo', '双路线水晶防守', 0, 72, 260, 16, new Color(71, 85, 105, 255));
          this.createCocosTextInRoot(root, 'DifficultyTitle', '难度', -220, -98, 100, 16, new Color(30, 41, 59, 255));
          this.createDifficultyButton('新手', 'beginner', -90);
          this.createDifficultyButton('普通', 'normal', 0);
          this.createDifficultyButton('困难', 'hard', 90);
          this.createCocosTextInRoot(root, 'SelectedDifficulty', "\u5F53\u524D\uFF1A" + DIFFICULTY_CONFIG[this.pendingDifficulty].name, 0, -142, 220, 14, new Color(71, 85, 105, 255));
          this.createButton('✔', 0, -190, 86, function () {
            return _this6.startGame(_this6.pendingDifficulty);
          });
        };

        _proto.showSettingsScreen = function showSettingsScreen() {
          var _this7 = this;

          this.currentScreen = 'settings';
          var root = this.resetRuntimeRoot();
          this.createBackground();
          this.createButton('返回', -420, 245, 70, function () {
            return _this7.showHomeScreen();
          });
          this.createCocosTextInRoot(root, 'SettingsTitle', '设置', 0, 150, 260, 30, new Color(24, 47, 79, 255));
          this.createCocosTextInRoot(root, 'VolumeLabel', "\u97F3\u91CF\uFF1A" + this.volume, 0, 70, 220, 20, new Color(30, 41, 59, 255));
          this.createButton('-', -70, 10, 60, function () {
            return _this7.adjustVolume(-10);
          });
          this.createButton('+', 70, 10, 60, function () {
            return _this7.adjustVolume(10);
          });
        };

        _proto.showCreditsScreen = function showCreditsScreen() {
          var _this8 = this;

          this.currentScreen = 'credits';
          var root = this.resetRuntimeRoot();
          this.createBackground();
          this.createButton('返回', -420, 245, 70, function () {
            return _this8.showHomeScreen();
          });
          this.createCocosTextInRoot(root, 'CreditsTitle', '鸣谢', 0, 145, 260, 30, new Color(24, 47, 79, 255));
          this.createCocosTextInRoot(root, 'CreditsBody', '原型设计与实现：Divine Tower Chess\n素材：占位贴图\n引擎：Cocos Creator 3.4.0', 0, 55, 420, 18, new Color(30, 41, 59, 255));
        };

        _proto.createDifficultyButton = function createDifficultyButton(text, difficulty, x) {
          var _this9 = this;

          var previousDifficulty = this.pendingDifficulty;
          var selected = previousDifficulty === difficulty;
          this.createButton(selected ? text + "*" : text, x, -100, 72, function () {
            _this9.pendingDifficulty = difficulty;

            _this9.showMapSelectScreen();
          });
        };

        _proto.adjustVolume = function adjustVolume(delta) {
          this.volume = Math.max(0, Math.min(100, this.volume + delta));
          this.showSettingsScreen();
        };

        _proto.buildRuntimeUi = function buildRuntimeUi() {
          var _this10 = this;

          var root = this.resetRuntimeRoot();
          this.createBackground();
          this.createButton('首页', -430, 250, 62, function () {
            return _this10.showHomeScreen();
          });
          this.createButton('刷新', -360, 250, 66, function () {
            return _this10.refreshShop();
          });
          this.createButton('买1', -290, 250, 56, function () {
            return _this10.buySlot0();
          });
          this.createButton('买2', -230, 250, 56, function () {
            return _this10.buySlot1();
          });
          this.createButton('买3', -170, 250, 56, function () {
            return _this10.buySlot2();
          });
          this.createButton('全买', -105, 250, 62, function () {
            return _this10.buyAll();
          });
          this.createButton('自动上阵', -20, 250, 86, function () {
            return _this10.autoPlaceBench();
          });
          this.createButton('开战', 64, 250, 62, function () {
            return _this10.beginBattle();
          });
          this.createButton('移动首个', -430, 214, 82, function () {
            return _this10.moveFirstPlaced();
          });
          this.createButton('速度', -340, 214, 62, function () {
            return _this10.toggleSpeed();
          });
          this.createButton('HTML调试', -260, 214, 82, function () {
            return _this10.toggleHtmlDebug();
          });
          this.createCocosBoardRoot();
          this.createCocosBenchRoot();
          var statusNode = new Node('Status');
          statusNode.layer = Layers.Enum.UI_2D;
          root.addChild(statusNode);
          statusNode.setPosition(new Vec3(0, -229, 0));
          var transform = statusNode.addComponent(UITransform);
          transform.setContentSize(900, 66);
          var label = statusNode.addComponent(Label);
          label.color = new Color(30, 30, 30, 255);
          label.fontSize = 12;
          label.lineHeight = 14;
          label.string = '';
          this.statusLabel = label;
        };

        _proto.ensureRuntimeCanvas = function ensureRuntimeCanvas() {
          var scene = director.getScene();
          var canvasNode = this.node.getComponent(Canvas) ? this.node : null;

          if (!canvasNode && scene) {
            var existingCanvas = this.findComponentInChildren(scene, Canvas);

            if (existingCanvas) {
              canvasNode = existingCanvas.node;
            }
          }

          if (!canvasNode) {
            canvasNode = new Node('RuntimeCanvas');
            canvasNode.layer = Layers.Enum.UI_2D;
            scene === null || scene === void 0 ? void 0 : scene.addChild(canvasNode);
            canvasNode.addComponent(Canvas);
          }

          var transform = canvasNode.getComponent(UITransform);

          if (!transform) {
            transform = canvasNode.addComponent(UITransform);
          }

          transform.setContentSize(960, 540);
          canvasNode.layer = Layers.Enum.UI_2D;
          var canvas = canvasNode.getComponent(Canvas);
          var camera = this.ensureUiCamera(canvasNode);

          if (canvas && camera) {
            canvas.cameraComponent = camera;
          }

          this.uiRoot = canvasNode;
        };

        _proto.ensureUiCamera = function ensureUiCamera(canvasNode) {
          var scene = director.getScene();

          if (!scene) {
            return null;
          }

          var canvasCamera = this.findComponentInChildren(canvasNode, Camera);

          if (canvasCamera) {
            canvasCamera.visibility |= Layers.Enum.UI_2D;
            return canvasCamera;
          }

          var cameras = this.findComponentsInChildren(scene, Camera);
          var existingCamera = cameras.find(function (camera) {
            return (camera.visibility & Layers.Enum.UI_2D) !== 0;
          });

          if (existingCamera) {
            existingCamera.visibility |= Layers.Enum.UI_2D;
            return existingCamera;
          }

          var cameraNode = new Node('RuntimeUICamera');
          canvasNode.addChild(cameraNode);
          cameraNode.setPosition(new Vec3(0, 0, 1000));
          var camera = cameraNode.addComponent(Camera);
          camera.visibility = Layers.Enum.UI_2D;
          camera.orthoHeight = 270;
          return camera;
        };

        _proto.findComponentInChildren = function findComponentInChildren(root, component) {
          var _this$findComponentsI;

          return (_this$findComponentsI = this.findComponentsInChildren(root, component)[0]) !== null && _this$findComponentsI !== void 0 ? _this$findComponentsI : null;
        };

        _proto.findComponentsInChildren = function findComponentsInChildren(root, component) {
          var found = [];

          var visit = function visit(node) {
            var item = node.getComponent(component);

            if (item) {
              found.push(item);
            }

            for (var _iterator2 = _createForOfIteratorHelperLoose(node.children), _step2; !(_step2 = _iterator2()).done;) {
              var child = _step2.value;
              visit(child);
            }
          };

          visit(root);
          return found;
        };

        _proto.createCocosBoardRoot = function createCocosBoardRoot() {
          var _this$uiRoot2;

          var board = new Node('CocosBoard');
          board.layer = Layers.Enum.UI_2D;
          ((_this$uiRoot2 = this.uiRoot) !== null && _this$uiRoot2 !== void 0 ? _this$uiRoot2 : this.node).addChild(board);
          board.setPosition(new Vec3(0, 45, 0));
          var transform = board.addComponent(UITransform);
          transform.setContentSize(760, 230);
          this.cocosBoardRoot = board;
        };

        _proto.createCocosBenchRoot = function createCocosBenchRoot() {
          var _this$uiRoot3;

          var bench = new Node('CocosBench');
          bench.layer = Layers.Enum.UI_2D;
          ((_this$uiRoot3 = this.uiRoot) !== null && _this$uiRoot3 !== void 0 ? _this$uiRoot3 : this.node).addChild(bench);
          bench.setPosition(new Vec3(0, -128, 0));
          var transform = bench.addComponent(UITransform);
          transform.setContentSize(760, 58);
          this.cocosBenchRoot = bench;
        };

        _proto.buildBrowserOverlay = function buildBrowserOverlay() {
          var _this$domRoot,
              _this11 = this;

          var doc = globalThis.document;

          if (!(doc === null || doc === void 0 ? void 0 : doc.body)) {
            return;
          }

          (_this$domRoot = this.domRoot) === null || _this$domRoot === void 0 ? void 0 : _this$domRoot.remove();
          var root = doc.createElement('div');
          root.id = 'divine-tower-chess-debug-ui';
          root.style.position = 'fixed';
          root.style.left = '12px';
          root.style.top = '12px';
          root.style.zIndex = '999999';
          root.style.width = '760px';
          root.style.maxWidth = 'calc(100vw - 24px)';
          root.style.maxHeight = 'calc(100vh - 24px)';
          root.style.overflow = 'auto';
          root.style.padding = '12px';
          root.style.background = 'rgba(245, 248, 252, 0.96)';
          root.style.border = '1px solid #8ca0b3';
          root.style.borderRadius = '6px';
          root.style.color = '#1f2933';
          root.style.fontFamily = 'Menlo, Consolas, monospace';
          root.style.fontSize = '13px';
          root.style.lineHeight = '18px';
          var title = doc.createElement('div');
          title.textContent = 'Divine Tower Chess 试玩面板';
          title.style.fontWeight = '700';
          title.style.marginBottom = '8px';
          root.appendChild(title);
          var actions = doc.createElement('div');
          actions.style.display = 'flex';
          actions.style.flexWrap = 'wrap';
          actions.style.gap = '6px';
          actions.style.marginBottom = '10px';
          root.appendChild(actions);
          this.addDomButton(actions, '新手', function () {
            return _this11.startBeginner();
          });
          this.addDomButton(actions, '普通', function () {
            return _this11.startNormal();
          });
          this.addDomButton(actions, '困难', function () {
            return _this11.startHard();
          });
          this.addDomButton(actions, '刷新', function () {
            return _this11.refreshShop();
          });
          this.addDomButton(actions, '买1', function () {
            return _this11.buySlot0();
          });
          this.addDomButton(actions, '买2', function () {
            return _this11.buySlot1();
          });
          this.addDomButton(actions, '买3', function () {
            return _this11.buySlot2();
          });
          this.addDomButton(actions, '全买', function () {
            return _this11.buyAll();
          });
          this.addDomButton(actions, '自动上阵', function () {
            return _this11.autoPlaceBench();
          });
          this.addDomButton(actions, '移动首个', function () {
            return _this11.moveFirstPlaced();
          });
          this.addDomButton(actions, '开战', function () {
            return _this11.beginBattle();
          });
          this.addDomButton(actions, '速度', function () {
            return _this11.toggleSpeed();
          });
          var board = doc.createElement('div');
          board.style.position = 'relative';
          board.style.width = '720px';
          board.style.height = '260px';
          board.style.marginBottom = '10px';
          board.style.background = '#d7e2ec';
          board.style.border = '1px solid #8ca0b3';
          board.style.borderRadius = '4px';
          root.appendChild(board);
          var status = doc.createElement('pre');
          status.style.margin = '0';
          status.style.whiteSpace = 'pre-wrap';
          root.appendChild(status);
          doc.body.appendChild(root);
          this.domRoot = root;
          this.domBoard = board;
          this.domStatus = status;
        };

        _proto.removeBrowserOverlay = function removeBrowserOverlay() {
          var _this$domRoot2;

          if ((_this$domRoot2 = this.domRoot) === null || _this$domRoot2 === void 0 ? void 0 : _this$domRoot2.parentElement) {
            this.domRoot.parentElement.removeChild(this.domRoot);
          }

          this.domRoot = null;
          this.domBoard = null;
          this.domStatus = null;
        };

        _proto.addDomButton = function addDomButton(parent, text, onClick) {
          var button = globalThis.document.createElement('button');
          button.textContent = text;
          button.style.padding = '6px 10px';
          button.style.border = '1px solid #3a63a8';
          button.style.borderRadius = '4px';
          button.style.background = '#3a63a8';
          button.style.color = '#fff';
          button.style.cursor = 'pointer';
          button.onclick = onClick;
          parent.appendChild(button);
        };

        _proto.createBackground = function createBackground() {
          var _this$uiRoot4;

          var background = new Node('RuntimeBackground');
          background.layer = Layers.Enum.UI_2D;
          ((_this$uiRoot4 = this.uiRoot) !== null && _this$uiRoot4 !== void 0 ? _this$uiRoot4 : this.node).addChild(background);
          background.setPosition(new Vec3(0, 0, 0));
          var transform = background.addComponent(UITransform);
          transform.setContentSize(960, 540);
          var graphics = background.addComponent(Graphics);
          graphics.fillColor = new Color(235, 240, 245, 255);
          graphics.rect(-480, -270, 960, 540);
          graphics.fill();
        };

        _proto.createButton = function createButton(text, x, y, width, onClick) {
          var _this$uiRoot5;

          var height = 30;
          var node = new Node(text);
          node.layer = Layers.Enum.UI_2D;
          ((_this$uiRoot5 = this.uiRoot) !== null && _this$uiRoot5 !== void 0 ? _this$uiRoot5 : this.node).addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, height);
          var graphics = node.addComponent(Graphics);
          graphics.fillColor = new Color(58, 99, 168, 255);
          graphics.rect(-width / 2, -height / 2, width, height);
          graphics.fill();
          node.addComponent(Button);
          node.on(Button.EventType.CLICK, onClick, this);
          var labelNode = new Node(text + "Label");
          labelNode.layer = Layers.Enum.UI_2D;
          node.addChild(labelNode);
          labelNode.setPosition(new Vec3(0, 0, 0));
          var labelTransform = labelNode.addComponent(UITransform);
          labelTransform.setContentSize(width, height);
          var label = labelNode.addComponent(Label);
          label.string = text;
          label.color = new Color(255, 255, 255, 255);
          label.fontSize = 15;
          label.lineHeight = 18;
        };

        _proto.findFirstOpenTile = function findFirstOpenTile(ignoreInstanceId) {
          var placed = this.controller.snapshot().placed;

          var _loop = function _loop(lane) {
            var _loop2 = function _loop2(tileIndex) {
              var occupied = placed.some(function (unit) {
                return unit.instanceId !== ignoreInstanceId && unit.lane === lane && unit.tileIndex === tileIndex;
              });

              if (!occupied) {
                return {
                  v: {
                    v: {
                      lane: lane,
                      tileIndex: tileIndex
                    }
                  }
                };
              }
            };

            for (var tileIndex = 0; tileIndex < 6; tileIndex += 1) {
              var _ret2 = _loop2(tileIndex);

              if (typeof _ret2 === "object") return _ret2.v;
            }
          };

          for (var lane = 0; lane < 2; lane += 1) {
            var _ret = _loop(lane);

            if (typeof _ret === "object") return _ret.v;
          }

          return null;
        };

        _proto.logAndRefresh = function logAndRefresh(action, success) {
          this.refreshStatus("" + action + (success ? '成功' : '失败'));
        };

        _proto.refreshStatus = function refreshStatus(message) {
          if (message === void 0) {
            message = '';
          }

          if (!this.statusLabel) {
            return;
          }

          var snapshot = this.controller.snapshot();
          var shop = snapshot.shop.map(function (unitId, index) {
            return index + 1 + "." + UNIT_CONFIG[unitId].name + "(" + UNIT_CONFIG[unitId].cost + ")";
          }).join('  ') || '空';
          var bench = snapshot.bench.map(function (unit) {
            return "" + UNIT_CONFIG[unit.unitId].name + unit.star + "\u661F" + (unit.assignedTaskId ? '[任务]' : '');
          }).join('  ') || '空';
          var placed = snapshot.placed.map(function (unit) {
            var maxHp = UNIT_CONFIG[unit.unitId].maxHp;
            return "" + UNIT_CONFIG[unit.unitId].name + unit.star + "\u661F " + Math.ceil(unit.currentHp) + "/" + maxHp + (unit.assignedTaskId ? ' [任务]' : '');
          }).join('  ') || '空';
          var tasks = snapshot.divineTasks.map(function (task) {
            var config = DIVINE_TASK_CONFIG[task.taskId];
            return config.sourceUnitId + "->" + config.targetUnitId + " " + Math.floor(task.progress) + "/" + config.requirement + (task.completed ? ' 完成' : '');
          }).join('  ') || '空';
          var enemiesByLane = [0, 1].map(function (lane) {
            return "\u8DEF\u7EBF" + lane + ": " + snapshot.enemies.filter(function (enemy) {
              return enemy.lane === lane;
            }).length;
          }).join('  ');
          var spriteCount = [this.boardSprite, this.tileSprite, this.unitSprite, this.enemySprite, this.crystalSprite].filter(Boolean).length;
          var benchSummary = snapshot.bench.length > 4 ? snapshot.bench.length + "\u4E2A\uFF1A" + snapshot.bench.slice(0, 4).map(function (unit) {
            return "" + UNIT_CONFIG[unit.unitId].name + unit.star + "\u661F";
          }).join('  ') + "..." : bench;
          var placedSummary = snapshot.placed.length > 4 ? snapshot.placed.length + "\u4E2A\uFF1A" + snapshot.placed.slice(0, 4).map(function (unit) {
            return "" + UNIT_CONFIG[unit.unitId].name + unit.star + "\u661F " + Math.ceil(unit.currentHp) + "/" + UNIT_CONFIG[unit.unitId].maxHp;
          }).join('  ') + "..." : placed;
          this.statusLabel.string = ["\u72B6\u6001: " + snapshot.phase + "  \u6CE2\u6B21: " + snapshot.waveNumber + "/" + snapshot.totalWaves + "  \u6C34\u6676: " + snapshot.crystalHp + "  \u91D1\u5E01: " + snapshot.gold + "  \u901F\u5EA6: x" + this.speed + "  \u8D34\u56FE: " + spriteCount + "/5", message ? "\u63D0\u793A: " + message : '提示: 购买棋子 -> 自动上阵 -> 开战', "\u5546\u5E97: " + shop, "\u5907\u6218\u533A: " + benchSummary + "  |  \u4E0A\u9635\u533A: " + placedSummary, "\u654C\u4EBA: " + enemiesByLane + "  |  \u795E\u54C1\u4EFB\u52A1: " + tasks].join('\n');

          if (this.domStatus) {
            this.domStatus.textContent = this.statusLabel.string;
          }

          this.renderCocosBoard();
          this.renderCocosBench();
          this.renderDomBoard();
        };

        _proto.selectUnit = function selectUnit(instanceId, source) {
          var snapshot = this.controller.snapshot();

          if (snapshot.phase !== 'prep') {
            this.refreshStatus('只能在准备阶段选择和移动棋子');
            return;
          }

          this.selectedUnitInstanceId = instanceId;
          this.selectedUnitSource = source;
          this.refreshStatus("\u5DF2\u9009\u62E9" + instanceId + "\uFF0C\u70B9\u51FB\u68CB\u76D8\u7A7A\u683C\u653E\u7F6E\u6216\u79FB\u52A8");
        };

        _proto.handleTileClick = function handleTileClick(lane, tileIndex) {
          var snapshot = this.controller.snapshot();
          var unitOnTile = snapshot.placed.find(function (unit) {
            return unit.lane === lane && unit.tileIndex === tileIndex;
          });

          if (!this.selectedUnitInstanceId || !this.selectedUnitSource) {
            if (unitOnTile) {
              this.selectUnit(unitOnTile.instanceId, 'placed');
              return;
            }

            this.refreshStatus('先点击备战区或棋盘上的棋子');
            return;
          }

          if (unitOnTile && unitOnTile.instanceId !== this.selectedUnitInstanceId) {
            this.refreshStatus('目标格已有棋子，请选择空格移动');
            return;
          }

          var success = this.selectedUnitSource === 'bench' ? this.controller.place(this.selectedUnitInstanceId, lane, tileIndex) : this.controller.movePlaced(this.selectedUnitInstanceId, lane, tileIndex);
          var action = this.selectedUnitSource === 'bench' ? '上阵' : '移动';

          if (success) {
            this.selectedUnitInstanceId = null;
            this.selectedUnitSource = null;
          }

          this.refreshStatus("" + action + (success ? '成功' : '失败'));
        };

        _proto.renderCocosBoard = function renderCocosBoard() {
          var _this12 = this;

          if (!this.cocosBoardRoot) {
            return;
          }

          var snapshot = this.controller.snapshot();
          this.cocosBoardRoot.removeAllChildren();
          this.createCocosImageOrRect('BoardBackground', 0, 0, 720, 220, new Color(215, 226, 236, 255), this.boardSprite);
          this.createCocosImageOrRect('Crystal', 315, 0, 38, 90, new Color(56, 189, 248, 255), this.crystalSprite);
          this.createCocosText('CrystalLabel', '水晶', 315, 0, 34, 17, new Color(8, 51, 68, 255));

          var _loop3 = function _loop3(lane) {
            var y = _this12.getCocosLaneY(lane);

            _this12.createCocosRect("Lane" + lane, 0, y, 590, 14, new Color(148, 163, 184, 255));

            var _loop4 = function _loop4(tileIndex) {
              var pos = _this12.getCocosTilePosition(lane, tileIndex);

              var isSelectedTarget = Boolean(_this12.selectedUnitInstanceId);

              var tileClick = function tileClick() {
                return _this12.handleTileClick(lane, tileIndex);
              };

              _this12.createCocosImageOrRect("Tile" + lane + "-" + tileIndex, pos.x, pos.y, 54, 54, isSelectedTarget ? new Color(222, 247, 236, 180) : new Color(248, 250, 252, 120), _this12.tileSprite, tileClick);

              _this12.createCocosText("TileLabel" + lane + "-" + tileIndex, lane + "-" + tileIndex, pos.x, pos.y - 20, 40, 11, new Color(71, 85, 105, 255), tileClick);
            };

            for (var tileIndex = 0; tileIndex < 6; tileIndex += 1) {
              _loop4(tileIndex);
            }
          };

          for (var lane = 0; lane < 2; lane += 1) {
            _loop3(lane);
          }

          var _loop5 = function _loop5() {
            var unit = _step3.value;

            var pos = _this12.getCocosTilePosition(unit.lane, unit.tileIndex);

            var unitClick = function unitClick() {
              return _this12.selectUnit(unit.instanceId, 'placed');
            };

            _this12.createCocosUnitAvatar(_this12.cocosBoardRoot, "Unit" + unit.instanceId, unit.unitId, unit.star, pos.x, pos.y + 4, 48, unit.currentHp <= 0, unitClick);

            var selected = _this12.selectedUnitInstanceId === unit.instanceId;

            _this12.createCocosText("UnitLabel" + unit.instanceId, "" + (selected ? '选中 ' : '') + unit.star + "\u661F " + Math.ceil(unit.currentHp), pos.x, pos.y - 26, 46, 10, new Color(17, 24, 39, 255), unitClick);
          };

          for (var _iterator3 = _createForOfIteratorHelperLoose(snapshot.placed), _step3; !(_step3 = _iterator3()).done;) {
            _loop5();
          }

          for (var _iterator4 = _createForOfIteratorHelperLoose(snapshot.enemies), _step4; !(_step4 = _iterator4()).done;) {
            var enemy = _step4.value;
            this.createCocosImageOrCircle("Enemy" + enemy.instanceId, this.getCocosEnemyX(enemy.distanceOnPath), this.getCocosLaneY(enemy.lane), 18, new Color(194, 65, 12, 255), this.enemySprite);
          }
        };

        _proto.renderCocosBench = function renderCocosBench() {
          var _this13 = this;

          if (!this.cocosBenchRoot) {
            return;
          }

          var snapshot = this.controller.snapshot();
          this.cocosBenchRoot.removeAllChildren();
          this.createCocosRectInRoot(this.cocosBenchRoot, 'BenchBackground', 0, 0, 760, 58, new Color(224, 231, 238, 255));
          this.createCocosTextInRoot(this.cocosBenchRoot, 'BenchTitle', '备战区：点棋子再点格子', -285, 19, 180, 12, new Color(30, 41, 59, 255));
          var shown = snapshot.bench.slice(0, 8);
          shown.forEach(function (unit, index) {
            var x = -325 + index * 80;
            var selected = _this13.selectedUnitInstanceId === unit.instanceId;

            var benchClick = function benchClick() {
              return _this13.selectUnit(unit.instanceId, 'bench');
            };

            _this13.createCocosUnitAvatar(_this13.cocosBenchRoot, "BenchUnit" + unit.instanceId, unit.unitId, unit.star, x, -4, 34, false, benchClick);

            _this13.createCocosTextInRoot(_this13.cocosBenchRoot, "BenchUnitLabel" + unit.instanceId, "" + (selected ? '选中 ' : '') + unit.star + "\u661F" + (unit.assignedTaskId ? ' 任务' : ''), x, -25, 62, 10, new Color(17, 24, 39, 255), benchClick);
          });

          if (snapshot.bench.length > shown.length) {
            this.createCocosTextInRoot(this.cocosBenchRoot, 'BenchOverflow', "+" + (snapshot.bench.length - shown.length), 355, -8, 36, 12, new Color(100, 116, 139, 255));
          }
        };

        _proto.createCocosUnitAvatar = function createCocosUnitAvatar(root, name, unitId, star, x, y, size, defeated, onClick) {
          if (!root) return;
          var style = this.getUnitAvatarStyle(unitId, star, defeated);
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          root.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(size, size);
          var graphics = node.addComponent(Graphics);

          if (style.divine) {
            var glowPulse = 0.5 + Math.sin(this.avatarPulseTime * 6) * 0.5;
            graphics.fillColor = new Color(255, 214, 90, Math.floor(70 + glowPulse * 95));
            graphics.circle(0, 0, size * (0.58 + glowPulse * 0.06));
            graphics.fill();
          }

          graphics.fillColor = style.border;
          graphics.circle(0, 0, size * 0.5);
          graphics.fill();
          graphics.fillColor = style.fill;
          graphics.circle(0, 0, size * 0.38);
          graphics.fill();

          if (onClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, onClick, this);
          }

          var avatarSprite = this.unitAvatarSprites[unitId];

          if (avatarSprite) {
            this.createCocosSpriteInRoot(node, name + "IconSprite", 0, 1, size * 0.64, size * 0.64, avatarSprite, defeated ? new Color(210, 214, 220, 210) : style.text, onClick);
          } else {
            this.createCocosTextInRoot(node, name + "Icon", style.icon, 0, 1, size, Math.max(12, Math.floor(size * 0.34)), style.text, onClick);
          }
        };

        _proto.getUnitAvatarStyle = function getUnitAvatarStyle(unitId, star, defeated) {
          var isDivine = UNIT_CONFIG[unitId].isDivine === true;
          var borderByStar = {
            1: new Color(145, 154, 166, 255),
            2: new Color(34, 197, 94, 255),
            3: new Color(147, 51, 234, 255)
          };
          var fillByUnit = {
            archer: new Color(76, 132, 92, 255),
            paladin: new Color(226, 184, 73, 255),
            shield_guard: new Color(75, 101, 132, 255),
            warrior: new Color(171, 73, 62, 255),
            mage: new Color(86, 112, 190, 255),
            priest: new Color(226, 218, 158, 255),
            cavalry: new Color(102, 99, 166, 255),
            spearman: new Color(78, 154, 144, 255),
            berserker: new Color(184, 42, 42, 255),
            light_mage: new Color(247, 226, 132, 255)
          };
          var iconByUnit = {
            archer: '弓',
            paladin: '圣',
            shield_guard: '盾',
            warrior: '战',
            mage: '法',
            priest: '牧',
            cavalry: '骑',
            spearman: '枪',
            berserker: '狂',
            light_mage: '光'
          };

          if (defeated) {
            return {
              fill: new Color(120, 126, 136, 255),
              border: new Color(78, 84, 94, 255),
              text: new Color(238, 242, 247, 255),
              icon: iconByUnit[unitId],
              divine: false
            };
          }

          return {
            fill: fillByUnit[unitId],
            border: isDivine ? new Color(245, 190, 60, 255) : borderByStar[star],
            text: isDivine ? new Color(72, 48, 8, 255) : new Color(248, 250, 252, 255),
            icon: iconByUnit[unitId],
            divine: isDivine
          };
        };

        _proto.createCocosRect = function createCocosRect(name, x, y, width, height, color, onClick) {
          if (!this.cocosBoardRoot) return;
          this.createCocosRectInRoot(this.cocosBoardRoot, name, x, y, width, height, color, onClick);
        };

        _proto.createCocosImageOrRect = function createCocosImageOrRect(name, x, y, width, height, color, spriteFrame, onClick) {
          if (!this.cocosBoardRoot) return;
          this.createCocosImageOrRectInRoot(this.cocosBoardRoot, name, x, y, width, height, color, spriteFrame, onClick);
        };

        _proto.createCocosRectInRoot = function createCocosRectInRoot(root, name, x, y, width, height, color, onClick) {
          this.createCocosImageOrRectInRoot(root, name, x, y, width, height, color, null, onClick);
        };

        _proto.createCocosImageOrRectInRoot = function createCocosImageOrRectInRoot(root, name, x, y, width, height, color, spriteFrame, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          root.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, height);

          if (spriteFrame) {
            var sprite = node.addComponent(Sprite);
            sprite.spriteFrame = spriteFrame;
            sprite.color = new Color(255, 255, 255, 255);
          } else {
            var graphics = node.addComponent(Graphics);
            graphics.fillColor = color;
            graphics.rect(-width / 2, -height / 2, width, height);
            graphics.fill();
          }

          if (onClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, onClick, this);
          }
        };

        _proto.createCocosSpriteInRoot = function createCocosSpriteInRoot(root, name, x, y, width, height, spriteFrame, color, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          root.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, height);
          var sprite = node.addComponent(Sprite);
          sprite.spriteFrame = spriteFrame;
          sprite.color = color;

          if (onClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, onClick, this);
          }
        };

        _proto.createCocosImageOrCircle = function createCocosImageOrCircle(name, x, y, size, color, spriteFrame) {
          if (spriteFrame) {
            this.createCocosImageOrRect(name, x, y, size, size, new Color(255, 255, 255, 255), spriteFrame);
            return;
          }

          this.createCocosCircle(name, x, y, size / 2, color);
        };

        _proto.createCocosCircle = function createCocosCircle(name, x, y, radius, color) {
          if (!this.cocosBoardRoot) return;
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.cocosBoardRoot.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(radius * 2, radius * 2);
          var graphics = node.addComponent(Graphics);
          graphics.fillColor = color;
          graphics.circle(0, 0, radius);
          graphics.fill();
        };

        _proto.createCocosText = function createCocosText(name, text, x, y, width, fontSize, color, onClick) {
          if (!this.cocosBoardRoot) return;
          this.createCocosTextInRoot(this.cocosBoardRoot, name, text, x, y, width, fontSize, color, onClick);
        };

        _proto.createCocosTextInRoot = function createCocosTextInRoot(root, name, text, x, y, width, fontSize, color, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          root.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, Math.max(40, fontSize * 3));
          var label = node.addComponent(Label);
          label.string = text;
          label.color = color;
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 2;

          if (onClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, onClick, this);
          }
        };

        _proto.renderDomBoard = function renderDomBoard() {
          if (!this.domBoard) {
            return;
          }

          var snapshot = this.controller.snapshot();
          this.domBoard.innerHTML = '';
          this.createDomCrystal();

          for (var lane = 0; lane < 2; lane += 1) {
            this.createDomLane(lane);

            for (var tileIndex = 0; tileIndex < 6; tileIndex += 1) {
              this.createDomTile(lane, tileIndex);
            }
          }

          for (var _iterator5 = _createForOfIteratorHelperLoose(snapshot.placed), _step5; !(_step5 = _iterator5()).done;) {
            var unit = _step5.value;
            var pos = this.getBoardTilePosition(unit.lane, unit.tileIndex);
            var el = globalThis.document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = pos.x - 28 + "px";
            el.style.top = pos.y - 26 + "px";
            el.style.width = '56px';
            el.style.height = '52px';
            el.style.border = unit.currentHp <= 0 ? '2px solid #8b1e1e' : '2px solid #1f4f8b';
            el.style.borderRadius = '6px';
            el.style.background = unit.currentHp <= 0 ? '#9ca3af' : '#f8fafc';
            el.style.color = '#111827';
            el.style.fontSize = '11px';
            el.style.lineHeight = '15px';
            el.style.textAlign = 'center';
            el.style.boxSizing = 'border-box';
            el.style.paddingTop = '3px';
            el.textContent = UNIT_CONFIG[unit.unitId].name + "\n" + unit.star + "\u661F\n" + Math.ceil(unit.currentHp);
            el.style.whiteSpace = 'pre-line';
            this.domBoard.appendChild(el);
          }

          for (var _iterator6 = _createForOfIteratorHelperLoose(snapshot.enemies), _step6; !(_step6 = _iterator6()).done;) {
            var enemy = _step6.value;
            var x = this.getEnemyX(enemy.distanceOnPath);
            var y = this.getLaneY(enemy.lane);

            var _el = globalThis.document.createElement('div');

            _el.style.position = 'absolute';
            _el.style.left = x - 10 + "px";
            _el.style.top = y - 10 + "px";
            _el.style.width = '20px';
            _el.style.height = '20px';
            _el.style.borderRadius = '10px';
            _el.style.background = '#c2410c';
            _el.style.border = '2px solid #7c2d12';
            _el.title = enemy.enemyId + " HP " + Math.ceil(enemy.currentHp);
            this.domBoard.appendChild(_el);
          }
        };

        _proto.createDomLane = function createDomLane(lane) {
          if (!this.domBoard) return;
          var y = this.getLaneY(lane);
          var line = globalThis.document.createElement('div');
          line.style.position = 'absolute';
          line.style.left = '40px';
          line.style.top = y - 8 + "px";
          line.style.width = '610px';
          line.style.height = '16px';
          line.style.background = '#94a3b8';
          line.style.borderRadius = '8px';
          this.domBoard.appendChild(line);
        };

        _proto.createDomTile = function createDomTile(lane, tileIndex) {
          if (!this.domBoard) return;
          var pos = this.getBoardTilePosition(lane, tileIndex);
          var tile = globalThis.document.createElement('div');
          tile.style.position = 'absolute';
          tile.style.left = pos.x - 32 + "px";
          tile.style.top = pos.y - 32 + "px";
          tile.style.width = '64px';
          tile.style.height = '64px';
          tile.style.border = '1px dashed #475569';
          tile.style.borderRadius = '4px';
          tile.style.boxSizing = 'border-box';
          tile.style.background = 'rgba(255, 255, 255, 0.35)';
          tile.style.color = '#334155';
          tile.style.fontSize = '11px';
          tile.style.textAlign = 'center';
          tile.style.lineHeight = '64px';
          tile.textContent = lane + "-" + tileIndex;
          this.domBoard.appendChild(tile);
        };

        _proto.createDomCrystal = function createDomCrystal() {
          if (!this.domBoard) return;
          var crystal = globalThis.document.createElement('div');
          crystal.style.position = 'absolute';
          crystal.style.right = '18px';
          crystal.style.top = '82px';
          crystal.style.width = '42px';
          crystal.style.height = '96px';
          crystal.style.borderRadius = '6px';
          crystal.style.background = '#38bdf8';
          crystal.style.border = '2px solid #0369a1';
          crystal.style.color = '#083344';
          crystal.style.fontSize = '12px';
          crystal.style.lineHeight = '96px';
          crystal.style.textAlign = 'center';
          crystal.textContent = '水晶';
          this.domBoard.appendChild(crystal);
        };

        _proto.getBoardTilePosition = function getBoardTilePosition(lane, tileIndex) {
          return {
            x: 90 + tileIndex * 86,
            y: this.getLaneY(lane)
          };
        };

        _proto.getEnemyX = function getEnemyX(distanceOnPath) {
          return Math.min(650, 45 + distanceOnPath * 39);
        };

        _proto.getLaneY = function getLaneY(lane) {
          return lane === 0 ? 85 : 175;
        };

        _proto.getCocosTilePosition = function getCocosTilePosition(lane, tileIndex) {
          return {
            x: -270 + tileIndex * 82,
            y: this.getCocosLaneY(lane)
          };
        };

        _proto.getCocosEnemyX = function getCocosEnemyX(distanceOnPath) {
          return Math.min(290, -315 + distanceOnPath * 39);
        };

        _proto.getCocosLaneY = function getCocosLaneY(lane) {
          return lane === 0 ? 36 : -36;
        };

        return CocosGameController;
      }(Component), _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "boardSprite", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tileSprite", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "unitSprite", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "enemySprite", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "crystalSprite", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/divine-task-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './divine-task-config.ts', './random.ts'], function (exports) {
  'use strict';

  var _defineProperty, cclegacy, UNIT_CONFIG, DIVINE_TASK_CONFIG, chance;

  return {
    setters: [function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      DIVINE_TASK_CONFIG = module.DIVINE_TASK_CONFIG;
    }, function (module) {
      chance = module.chance;
    }],
    execute: function () {
      cclegacy._RF.push({}, "20d25IHuF1IIJ36693LniLC", "divine-task-system", undefined);

      var DivineTaskSystem = exports('DivineTaskSystem', /*#__PURE__*/function () {
        function DivineTaskSystem() {
          _defineProperty(this, "progresses", []);
        }

        var _proto = DivineTaskSystem.prototype;

        _proto.tryAssignTask = function tryAssignTask(unit) {
          if (unit.star !== 3 || unit.assignedTaskId) {
            return null;
          }

          var unitCfg = UNIT_CONFIG[unit.unitId];

          if (unitCfg.isDivine) {
            return null;
          }

          var existingTask = this.progresses.find(function (progress) {
            return progress.unitInstanceId === unit.instanceId && !progress.completed;
          });

          if (existingTask) {
            return null;
          }

          var taskConfig = Object.values(DIVINE_TASK_CONFIG).find(function (task) {
            return task.sourceUnitId === unit.unitId;
          });

          if (!taskConfig || !chance(taskConfig.triggerChance)) {
            return null;
          }

          var progress = {
            taskId: taskConfig.id,
            unitInstanceId: unit.instanceId,
            progress: 0,
            completed: false
          };
          this.progresses.push(progress);
          return progress;
        };

        _proto.addMetric = function addMetric(unitInstanceId, metric, amount) {
          if (amount <= 0) {
            return null;
          }

          var progress = this.progresses.find(function (p) {
            return p.unitInstanceId === unitInstanceId && !p.completed;
          });

          if (!progress) {
            return null;
          }

          var task = DIVINE_TASK_CONFIG[progress.taskId];

          if (task.metric !== metric) {
            return null;
          }

          progress.progress += amount;

          if (progress.progress >= task.requirement) {
            progress.completed = true;
          }

          return progress;
        };

        _proto.resolveCompleted = function resolveCompleted(unitInstanceId) {
          var progress = this.progresses.find(function (p) {
            return p.unitInstanceId === unitInstanceId && p.completed;
          });

          if (!progress) {
            return null;
          }

          return DIVINE_TASK_CONFIG[progress.taskId];
        };

        _proto.getAllProgress = function getAllProgress() {
          return [].concat(this.progresses);
        };

        return DivineTaskSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/enemy-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "348eaNGbiJBt5qphO8TFsUN", "enemy-config", undefined);

      var ENEMY_CONFIG = exports('ENEMY_CONFIG', {
        slime: {
          id: 'slime',
          name: '史莱姆',
          maxHp: 80,
          speed: 1.2,
          goldReward: 1,
          crystalDamage: 1
        },
        wolf: {
          id: 'wolf',
          name: '恶狼',
          maxHp: 140,
          speed: 1.6,
          goldReward: 2,
          crystalDamage: 1
        },
        brute: {
          id: 'brute',
          name: '重甲怪',
          maxHp: 320,
          speed: 0.8,
          goldReward: 4,
          crystalDamage: 2
        }
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/economy-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  'use strict';

  var _defineProperty, cclegacy;

  return {
    setters: [function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "361875FOyFCwZMKV9JBH4+I", "economy-system", undefined);

      var EconomySystem = exports('EconomySystem', /*#__PURE__*/function () {
        function EconomySystem() {
          _defineProperty(this, "gold", 0);
        }

        var _proto = EconomySystem.prototype;

        _proto.setStartingGold = function setStartingGold(value) {
          this.gold = value;
        };

        _proto.canSpend = function canSpend(cost) {
          return this.gold >= cost;
        };

        _proto.spend = function spend(cost) {
          if (!this.canSpend(cost)) {
            return false;
          }

          this.gold -= cost;
          return true;
        };

        _proto.earn = function earn(amount) {
          this.gold += amount;
        };

        _proto.getGold = function getGold() {
          return this.gold;
        };

        return EconomySystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/verify-divine-task-rules.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './unit-system.ts', './battle-system.ts', './divine-task-system.ts', './game-session.ts'], function (exports) {
  'use strict';

  var _createForOfIteratorHelperLoose, cclegacy, UNIT_CONFIG, UnitSystem, BattleSystem, DivineTaskSystem, GameSession;

  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      UnitSystem = module.UnitSystem;
    }, function (module) {
      BattleSystem = module.BattleSystem;
    }, function (module) {
      DivineTaskSystem = module.DivineTaskSystem;
    }, function (module) {
      GameSession = module.GameSession;
    }],
    execute: function () {
      exports('verifyDivineTaskRules', verifyDivineTaskRules);

      cclegacy._RF.push({}, "3fa01GpPwdJpJTrvnJvMvSX", "verify-divine-task-rules", undefined);

      function assertRule(condition, message) {
        if (!condition) {
          throw new Error("Divine task rule failed: " + message);
        }
      }

      function requireValue(value, message) {
        assertRule(value !== undefined && value !== null, message);
        return value;
      }

      function buildThreeStarUnits(unitSystem, unitId, count) {
        for (var i = 0; i < count * 9; i += 1) {
          unitSystem.addToBench(unitId);
        }
      }

      function assignAllEligibleTasks(unitSystem, divine) {
        for (var _iterator = _createForOfIteratorHelperLoose(unitSystem.getUnitsForTaskRoll()), _step; !(_step = _iterator()).done;) {
          var unit = _step.value;
          var progress = divine.tryAssignTask(unit);

          if (progress) {
            unitSystem.setAssignedTask(unit.instanceId, progress.taskId);
          }
        }
      }

      function withGuaranteedTaskRoll(cb) {
        var originalRandom = Math.random;

        Math.random = function () {
          return 0.01;
        };

        try {
          cb();
        } finally {
          Math.random = originalRandom;
        }
      }

      function verifyMultipleWarriorTasks() {
        var unitSystem = new UnitSystem();
        var divine = new DivineTaskSystem();
        buildThreeStarUnits(unitSystem, 'warrior', 2);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(unitSystem, divine);
        });
        var tasks = divine.getAllProgress().filter(function (task) {
          return task.taskId === 'warrior_to_berserker';
        });
        var unitIds = new Set(tasks.map(function (task) {
          return task.unitInstanceId;
        }));
        assertRule(tasks.length === 2, 'two 3-star warriors should each receive a warrior task');
        assertRule(unitIds.size === 2, 'warrior tasks should bind to different unit instances');
      }

      function verifyMultiplePriestTasks() {
        var unitSystem = new UnitSystem();
        var divine = new DivineTaskSystem();
        buildThreeStarUnits(unitSystem, 'priest', 2);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(unitSystem, divine);
        });
        var tasks = divine.getAllProgress().filter(function (task) {
          return task.taskId === 'priest_to_light_mage';
        });
        var unitIds = new Set(tasks.map(function (task) {
          return task.unitInstanceId;
        }));
        assertRule(tasks.length === 2, 'two 3-star priests should each receive a priest task');
        assertRule(unitIds.size === 2, 'priest tasks should bind to different unit instances');
      }

      function verifyMoveKeepsTaskIdentityAndProgress() {
        var unitSystem = new UnitSystem();
        var divine = new DivineTaskSystem();
        buildThreeStarUnits(unitSystem, 'warrior', 1);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(unitSystem, divine);
        });
        var task = requireValue(divine.getAllProgress()[0], 'warrior task should be assigned before movement verification');
        requireValue(unitSystem.getBenchUnits().find(function (unit) {
          return unit.instanceId === task.unitInstanceId;
        }), 'assigned warrior should still be available on bench before placement');
        assertRule(unitSystem.placeFromBench(task.unitInstanceId, 0, 1), 'assigned warrior should be placeable');
        divine.addMetric(task.unitInstanceId, 'kills', 25);
        var before = requireValue(unitSystem.getPlacedUnits().find(function (unit) {
          return unit.instanceId === task.unitInstanceId;
        }), 'assigned warrior should be placed before move');
        assertRule(unitSystem.movePlacedUnit(task.unitInstanceId, 1, 4), 'assigned warrior should move to an open tile');
        var after = requireValue(unitSystem.getPlacedUnits().find(function (unit) {
          return unit.instanceId === task.unitInstanceId;
        }), 'assigned warrior should still be placed after move');
        var progress = requireValue(divine.getAllProgress().find(function (item) {
          return item.unitInstanceId === task.unitInstanceId;
        }), 'assigned warrior should still have divine progress after move');
        assertRule(after.instanceId === before.instanceId, 'move should keep instanceId');
        assertRule(after.star === before.star, 'move should keep star level');
        assertRule(after.unitId === before.unitId, 'move should keep unitId');
        assertRule(after.assignedTaskId === before.assignedTaskId, 'move should keep assigned task id');
        assertRule(after.lane === 1 && after.tileIndex === 4, 'move should update only board position');
        assertRule(progress.progress === 25, 'move should keep divine task progress');
      }

      function verifyEvolutionTargets() {
        var warriorUnits = new UnitSystem();
        var warriorDivine = new DivineTaskSystem();
        buildThreeStarUnits(warriorUnits, 'warrior', 1);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(warriorUnits, warriorDivine);
        });
        var warriorTask = requireValue(warriorDivine.getAllProgress()[0], 'warrior task should be assigned');
        warriorDivine.addMetric(warriorTask.unitInstanceId, 'kills', 1000);
        var warriorCompletion = requireValue(warriorDivine.resolveCompleted(warriorTask.unitInstanceId), 'warrior task should complete');
        assertRule(warriorCompletion.targetUnitId === 'berserker', 'warrior task should resolve to berserker');
        warriorUnits.evolveUnit(warriorTask.unitInstanceId, warriorCompletion.targetUnitId);
        var evolvedWarrior = requireValue(warriorUnits.getBenchUnits().find(function (unit) {
          return unit.instanceId === warriorTask.unitInstanceId;
        }), 'completed warrior should still exist after evolution');
        assertRule(evolvedWarrior.unitId === 'berserker', 'completed warrior should evolve to berserker');
        assertRule(UNIT_CONFIG[evolvedWarrior.unitId].isDivine === true, 'berserker should be marked divine');
        var priestUnits = new UnitSystem();
        var priestDivine = new DivineTaskSystem();
        buildThreeStarUnits(priestUnits, 'priest', 1);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(priestUnits, priestDivine);
        });
        var priestTask = requireValue(priestDivine.getAllProgress()[0], 'priest task should be assigned');
        priestDivine.addMetric(priestTask.unitInstanceId, 'healing', 100000);
        var priestCompletion = requireValue(priestDivine.resolveCompleted(priestTask.unitInstanceId), 'priest task should complete');
        assertRule(priestCompletion.targetUnitId === 'light_mage', 'priest task should resolve to light mage');
        priestUnits.evolveUnit(priestTask.unitInstanceId, priestCompletion.targetUnitId);
        var evolvedPriest = requireValue(priestUnits.getBenchUnits().find(function (unit) {
          return unit.instanceId === priestTask.unitInstanceId;
        }), 'completed priest should still exist after evolution');
        assertRule(evolvedPriest.unitId === 'light_mage', 'completed priest should evolve to light mage');
        assertRule(UNIT_CONFIG[evolvedPriest.unitId].isDivine === true, 'light mage should be marked divine');
      }

      function verifyActualHealingOnly() {
        var battle = new BattleSystem();
        var priest = {
          instanceId: 'priest_test',
          unitId: 'priest',
          star: 3,
          lane: 0,
          tileIndex: 1,
          cooldownLeft: 0,
          currentHp: UNIT_CONFIG.priest.maxHp,
          assignedTaskId: 'priest_to_light_mage'
        };
        var warrior = {
          instanceId: 'warrior_test',
          unitId: 'warrior',
          star: 3,
          lane: 0,
          tileIndex: 0,
          cooldownLeft: 0,
          currentHp: UNIT_CONFIG.warrior.maxHp - 35
        };
        var damagedResult = battle.tick([priest, warrior], [], 0.2);
        assertRule(damagedResult.healingDoneByUnit.priest_test === 35, 'healing progress should count actual restored HP only');
        priest.cooldownLeft = 0;
        var fullHpResult = battle.tick([priest, warrior], [], 0.2);
        assertRule(!fullHpResult.healingDoneByUnit.priest_test, 'full HP targets should not create virtual healing progress');
      }

      function verifyDefeatedUnitLifecycle() {
        var battle = new BattleSystem();
        var defeatedArcher = {
          instanceId: 'defeated_archer',
          unitId: 'archer',
          star: 3,
          lane: 0,
          tileIndex: 1,
          cooldownLeft: 0,
          currentHp: 0
        };
        var enemy = {
          instanceId: 'enemy_test',
          enemyId: 'slime',
          lane: 0,
          currentHp: 80,
          distanceOnPath: 0,
          reachedCrystal: false
        };
        battle.tick([defeatedArcher], [enemy], 0.2);
        assertRule(enemy.currentHp === 80, 'defeated units should not attack during the current round');
        var unitSystem = new UnitSystem();
        unitSystem.addToBench('warrior');
        unitSystem.addToBench('priest');

        var _unitSystem$getBenchU = unitSystem.getBenchUnits(),
            warrior = _unitSystem$getBenchU[0],
            priest = _unitSystem$getBenchU[1];

        assertRule(unitSystem.placeFromBench(warrior.instanceId, 0, 0), 'warrior should be placed for defeat reset verification');
        assertRule(unitSystem.placeFromBench(priest.instanceId, 0, 1), 'priest should be placed for defeat reset verification');
        var placed = unitSystem.getPlacedUnits();
        var placedWarrior = requireValue(placed.find(function (unit) {
          return unit.instanceId === warrior.instanceId;
        }), 'placed warrior should exist for defeat reset verification');
        var placedPriest = requireValue(placed.find(function (unit) {
          return unit.instanceId === priest.instanceId;
        }), 'placed priest should exist for defeat reset verification');
        placedWarrior.currentHp = 0;
        placedWarrior.cooldownLeft = 2;
        placedPriest.currentHp = UNIT_CONFIG.priest.maxHp - 10;
        placedPriest.cooldownLeft = 2;
        var resetCount = unitSystem.resetDefeatedPlacedUnits();
        assertRule(resetCount === 1, 'only defeated placed units should be reset at round end');
        assertRule(placedWarrior.currentHp === UNIT_CONFIG.warrior.maxHp, 'defeated warrior should revive to max HP');
        assertRule(placedWarrior.cooldownLeft === 0, 'defeated warrior cooldown should reset for the next round');
        assertRule(placedPriest.currentHp === UNIT_CONFIG.priest.maxHp - 10, 'living damaged units should not be healed by defeat reset');
        assertRule(placedPriest.cooldownLeft === 2, 'living unit cooldown should not be changed by defeat reset');
      }

      function verifyMeleeAggroRules() {
        var battle = new BattleSystem();
        var shield = {
          instanceId: 'shield_test',
          unitId: 'shield_guard',
          star: 1,
          lane: 0,
          tileIndex: 1,
          cooldownLeft: 99,
          currentHp: UNIT_CONFIG.shield_guard.maxHp
        };
        var shieldEnemies = [0, 1, 2].map(function (index) {
          return {
            instanceId: "shield_enemy_" + index,
            enemyId: 'slime',
            lane: 0,
            currentHp: UNIT_CONFIG.archer.maxHp,
            distanceOnPath: 3.8,
            reachedCrystal: false
          };
        });
        battle.tick([shield], shieldEnemies, 1);
        assertRule(shield.currentHp === UNIT_CONFIG.shield_guard.maxHp - 15, 'shield guard should block and be attacked by all enemies in range');
        assertRule(shieldEnemies.every(function (enemy) {
          return enemy.distanceOnPath === 3.8;
        }), 'enemies blocked by shield guard should stop moving');
        var warrior = {
          instanceId: 'warrior_aggro_test',
          unitId: 'warrior',
          star: 1,
          lane: 0,
          tileIndex: 1,
          cooldownLeft: 99,
          currentHp: UNIT_CONFIG.warrior.maxHp
        };
        var meleeEnemies = [0, 1, 2].map(function (index) {
          return {
            instanceId: "melee_enemy_" + index,
            enemyId: 'slime',
            lane: 0,
            currentHp: UNIT_CONFIG.archer.maxHp,
            distanceOnPath: 3.8,
            reachedCrystal: false
          };
        });
        battle.tick([warrior], meleeEnemies, 1);
        assertRule(warrior.currentHp === UNIT_CONFIG.warrior.maxHp - 5, 'non-shield melee units should attract only one enemy');
        assertRule(meleeEnemies.filter(function (enemy) {
          return enemy.distanceOnPath === 3.8;
        }).length === 1, 'only the attracted enemy should stop against a non-shield melee unit');
        meleeEnemies[0].currentHp = 0;
        var warriorHpBeforeRefill = warrior.currentHp;
        battle.tick([warrior], meleeEnemies, 1);
        assertRule(warrior.currentHp === warriorHpBeforeRefill - 5, 'another enemy in range should fill the duel slot after the previous enemy dies');
        var archer = {
          instanceId: 'archer_aggro_test',
          unitId: 'archer',
          star: 1,
          lane: 0,
          tileIndex: 1,
          cooldownLeft: 99,
          currentHp: UNIT_CONFIG.archer.maxHp
        };
        var rangedEnemies = [0, 1].map(function (index) {
          return {
            instanceId: "ranged_enemy_" + index,
            enemyId: 'slime',
            lane: 0,
            currentHp: UNIT_CONFIG.archer.maxHp,
            distanceOnPath: 3.8,
            reachedCrystal: false
          };
        });
        battle.tick([archer], rangedEnemies, 1);
        assertRule(archer.currentHp === UNIT_CONFIG.archer.maxHp, 'ranged units should not attract normal enemy aggro');
        assertRule(rangedEnemies.every(function (enemy) {
          return enemy.distanceOnPath > 3.8;
        }), 'normal enemies should keep moving past ranged units');
      }

      function verifyRoundPhaseGuards() {
        var session = new GameSession();
        assertRule(!session.refreshShopByCost(), 'shop refresh should fail before game start');
        assertRule(!session.placeUnit('missing_unit', 0, 0), 'placement should fail before prep phase');
        assertRule(!session.beginBattle(), 'battle should not start before prep phase');
        session.startNewGame('beginner');
        assertRule(session.beginBattle(), 'battle should start from prep phase');
        assertRule(!session.refreshShopByCost(), 'shop refresh should fail during battle');
        assertRule(!session.buyShopUnit(0), 'buy should fail during battle');
        assertRule(!session.placeUnit('missing_unit', 0, 0), 'placement should fail during battle');
        assertRule(!session.beginBattle(), 'battle should not restart while already in battle');
      }

      function verifyMergeAcrossBenchAndPlaced() {
        var unitSystem = new UnitSystem();

        for (var i = 0; i < 3; i += 1) {
          unitSystem.addToBench('warrior');
        }

        var firstTwoStar = requireValue(unitSystem.getBenchUnits()[0], 'first 2-star warrior should be created on bench');
        assertRule(firstTwoStar.star === 2, 'three 1-star warriors should merge into one 2-star warrior');
        assertRule(unitSystem.placeFromBench(firstTwoStar.instanceId, 0, 0), '2-star warrior should be placeable before cross-area merge');
        var placedBeforeMerge = requireValue(unitSystem.getPlacedUnits().find(function (unit) {
          return unit.instanceId === firstTwoStar.instanceId;
        }), 'placed 2-star warrior should exist before cross-area merge');
        placedBeforeMerge.currentHp = 1;
        placedBeforeMerge.cooldownLeft = 3;

        for (var _i = 0; _i < 6; _i += 1) {
          unitSystem.addToBench('warrior');
        }

        var placedAfterMerge = requireValue(unitSystem.getPlacedUnits().find(function (unit) {
          return unit.instanceId === firstTwoStar.instanceId;
        }), 'placed warrior should be kept as merge result');
        assertRule(placedAfterMerge.star === 3, 'placed 2-star plus two bench 2-star warriors should merge into a placed 3-star warrior');
        assertRule(placedAfterMerge.currentHp === UNIT_CONFIG.warrior.maxHp, 'placed merge result should reset to max HP');
        assertRule(placedAfterMerge.cooldownLeft === 0, 'placed merge result should reset cooldown');
        assertRule(unitSystem.getBenchUnits().filter(function (unit) {
          return unit.unitId === 'warrior';
        }).length === 0, 'consumed bench merge materials should be removed');
      }

      function verifyAssignedUnitsDoNotMerge() {
        var unitSystem = new UnitSystem();
        var divine = new DivineTaskSystem();
        buildThreeStarUnits(unitSystem, 'warrior', 1);
        withGuaranteedTaskRoll(function () {
          return assignAllEligibleTasks(unitSystem, divine);
        });
        var assignedTask = requireValue(divine.getAllProgress()[0], 'warrior task should be assigned before protected merge verification');
        var assignedUnit = requireValue(unitSystem.getBenchUnits().find(function (unit) {
          return unit.instanceId === assignedTask.unitInstanceId;
        }), 'assigned 3-star warrior should stay on bench before protected merge verification');
        assertRule(assignedUnit.assignedTaskId === 'warrior_to_berserker', 'assigned warrior should hold the divine task id');

        for (var i = 0; i < 9; i += 1) {
          unitSystem.addToBench('warrior');
        }

        var stillAssigned = requireValue(unitSystem.getBenchUnits().find(function (unit) {
          return unit.instanceId === assignedTask.unitInstanceId;
        }), 'assigned warrior should not be consumed by later merges');
        var unassignedThreeStars = unitSystem.getBenchUnits().filter(function (unit) {
          return unit.unitId === 'warrior' && unit.star === 3 && !unit.assignedTaskId;
        });
        assertRule(stillAssigned.assignedTaskId === 'warrior_to_berserker', 'assigned warrior should keep task id after later merges');
        assertRule(unassignedThreeStars.length === 1, 'later unassigned warriors should merge separately from assigned task holder');
      }

      function verifyDivineTaskRules() {
        verifyMultipleWarriorTasks();
        verifyMultiplePriestTasks();
        verifyMoveKeepsTaskIdentityAndProgress();
        verifyEvolutionTargets();
        verifyActualHealingOnly();
        verifyDefeatedUnitLifecycle();
        verifyMeleeAggroRules();
        verifyRoundPhaseGuards();
        verifyMergeAcrossBenchAndPlaced();
        verifyAssignedUnitsDoNotMerge();
      }

      if (typeof require !== 'undefined' && require.main === module) {
        verifyDivineTaskRules();
        console.log('Divine task rules verified.');
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/random.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        chance: chance,
        pickN: pickN
      });

      cclegacy._RF.push({}, "53c1ayzZZFGHpY+7DUR2NcI", "random", undefined);

      function pickN(arr, count) {
        var copy = [].concat(arr);
        var out = [];

        for (var i = 0; i < count && copy.length > 0; i += 1) {
          var idx = Math.floor(Math.random() * copy.length);
          out.push(copy[idx]);
          copy.splice(idx, 1);
        }

        return out;
      }

      function chance(probability) {
        return Math.random() < probability;
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/unit-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "59d2a5HzEhDV6ST7CdBjGsH", "unit-config", undefined);

      var UNIT_CONFIG = exports('UNIT_CONFIG', {
        archer: {
          id: 'archer',
          name: '弓箭手',
          cost: 3,
          baseDamage: 18,
          attackInterval: 1,
          range: 4,
          maxHp: 140,
          skillType: 'single',
          aggroRole: 'ranged'
        },
        paladin: {
          id: 'paladin',
          name: '圣骑士',
          cost: 4,
          baseDamage: 16,
          attackInterval: 1.2,
          range: 1.8,
          maxHp: 260,
          skillType: 'none',
          aggroRole: 'melee'
        },
        shield_guard: {
          id: 'shield_guard',
          name: '盾卫',
          cost: 3,
          baseDamage: 12,
          attackInterval: 1.1,
          range: 1.5,
          maxHp: 300,
          skillType: 'none',
          aggroRole: 'blocker'
        },
        warrior: {
          id: 'warrior',
          name: '战士',
          cost: 3,
          baseDamage: 22,
          attackInterval: 1,
          range: 1.8,
          maxHp: 220,
          skillType: 'single',
          aggroRole: 'melee'
        },
        mage: {
          id: 'mage',
          name: '法师',
          cost: 4,
          baseDamage: 14,
          attackInterval: 1.4,
          range: 3.8,
          maxHp: 130,
          skillType: 'aoe',
          aggroRole: 'ranged'
        },
        priest: {
          id: 'priest',
          name: '牧师',
          cost: 4,
          baseDamage: 6,
          attackInterval: 1.5,
          range: 3.5,
          maxHp: 160,
          healPower: 20,
          skillType: 'heal',
          aggroRole: 'ranged'
        },
        cavalry: {
          id: 'cavalry',
          name: '骑兵',
          cost: 4,
          baseDamage: 24,
          attackInterval: 0.95,
          range: 2.2,
          maxHp: 200,
          skillType: 'single',
          aggroRole: 'melee'
        },
        spearman: {
          id: 'spearman',
          name: '枪兵',
          cost: 3,
          baseDamage: 19,
          attackInterval: 1,
          range: 2.6,
          maxHp: 170,
          skillType: 'single',
          aggroRole: 'melee'
        },
        berserker: {
          id: 'berserker',
          name: '狂战士',
          isDivine: true,
          cost: 0,
          baseDamage: 50,
          attackInterval: 0.7,
          range: 2.2,
          maxHp: 360,
          skillType: 'single',
          aggroRole: 'melee'
        },
        light_mage: {
          id: 'light_mage',
          name: '光法师',
          isDivine: true,
          cost: 0,
          baseDamage: 28,
          attackInterval: 1.1,
          range: 4.2,
          maxHp: 240,
          healPower: 40,
          skillType: 'heal',
          aggroRole: 'ranged'
        }
      });
      var SHOP_UNIT_POOL = exports('SHOP_UNIT_POOL', ['archer', 'paladin', 'shield_guard', 'warrior', 'mage', 'priest', 'cavalry', 'spearman']);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/battle-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './enemy-config.ts'], function (exports) {
  'use strict';

  var _createForOfIteratorHelperLoose, _defineProperty, cclegacy, UNIT_CONFIG, ENEMY_CONFIG;

  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      ENEMY_CONFIG = module.ENEMY_CONFIG;
    }],
    execute: function () {
      cclegacy._RF.push({}, "5e5af6hu6pIKrzqvnJnbp5Z", "battle-system", undefined);

      var BattleSystem = exports('BattleSystem', /*#__PURE__*/function () {
        function BattleSystem() {
          _defineProperty(this, "lanePathLength", [14, 15.5]);

          _defineProperty(this, "enemyDpsPerUnit", 5);

          _defineProperty(this, "firstTileDistance", 2);

          _defineProperty(this, "tileDistanceStep", 1.8);
        }

        var _proto = BattleSystem.prototype;

        _proto.tick = function tick(units, enemies, dt) {
          var _this = this;

          var killsByUnit = {};
          var healingDoneByUnit = {};
          var engagements = this.assignEngagements(units, enemies);

          for (var _iterator = _createForOfIteratorHelperLoose(enemies), _step; !(_step = _iterator()).done;) {
            var enemy = _step.value;
            if (enemy.currentHp <= 0) continue;
            if (engagements.has(enemy.instanceId)) continue;
            var cfg = ENEMY_CONFIG[enemy.enemyId];
            enemy.distanceOnPath += cfg.speed * dt;

            if (enemy.distanceOnPath >= this.lanePathLength[enemy.lane]) {
              enemy.reachedCrystal = true;
            }
          }

          engagements = this.assignEngagements(units, enemies);
          this.applyEnemyPressure(engagements, dt);

          var _loop = function _loop() {
            var unit = _step2.value;

            if (unit.currentHp <= 0) {
              return "continue";
            }

            var cfg = UNIT_CONFIG[unit.unitId];
            unit.cooldownLeft -= dt;
            if (unit.cooldownLeft > 0) return "continue";
            var laneEnemies = enemies.filter(function (enemy) {
              return !enemy.reachedCrystal && enemy.currentHp > 0 && enemy.lane === unit.lane;
            });
            var target = laneEnemies.sort(function (a, b) {
              return b.distanceOnPath - a.distanceOnPath;
            })[0];

            if (cfg.skillType === 'heal') {
              var healed = _this.applyHeal(unit, units);

              if (healed > 0) {
                var _healingDoneByUnit$un;

                healingDoneByUnit[unit.instanceId] = ((_healingDoneByUnit$un = healingDoneByUnit[unit.instanceId]) !== null && _healingDoneByUnit$un !== void 0 ? _healingDoneByUnit$un : 0) + healed;
              }
            } else {
              if (!target) {
                return "continue";
              }

              var damage = cfg.baseDamage * (1 + (unit.star - 1) * 0.8);

              if (cfg.skillType === 'aoe') {
                var splash = enemies.filter(function (enemy) {
                  return enemy.lane === unit.lane && !enemy.reachedCrystal && enemy.currentHp > 0 && Math.abs(enemy.distanceOnPath - target.distanceOnPath) <= 1.2;
                });

                for (var _iterator3 = _createForOfIteratorHelperLoose(splash), _step3; !(_step3 = _iterator3()).done;) {
                  var _enemy = _step3.value;
                  _enemy.currentHp -= damage;

                  if (_enemy.currentHp <= 0) {
                    var _killsByUnit$unit$ins;

                    killsByUnit[unit.instanceId] = ((_killsByUnit$unit$ins = killsByUnit[unit.instanceId]) !== null && _killsByUnit$unit$ins !== void 0 ? _killsByUnit$unit$ins : 0) + 1;
                  }
                }
              } else {
                target.currentHp -= damage;

                if (target.currentHp <= 0) {
                  var _killsByUnit$unit$ins2;

                  killsByUnit[unit.instanceId] = ((_killsByUnit$unit$ins2 = killsByUnit[unit.instanceId]) !== null && _killsByUnit$unit$ins2 !== void 0 ? _killsByUnit$unit$ins2 : 0) + 1;
                }
              }
            }

            unit.cooldownLeft = cfg.attackInterval;
          };

          for (var _iterator2 = _createForOfIteratorHelperLoose(units), _step2; !(_step2 = _iterator2()).done;) {
            var _ret = _loop();

            if (_ret === "continue") continue;
          }

          var killedEnemyIds = enemies.filter(function (e) {
            return e.currentHp <= 0;
          }).map(function (e) {
            return e.instanceId;
          });
          var goldFromKills = enemies.filter(function (e) {
            return e.currentHp <= 0;
          }).reduce(function (sum, e) {
            return sum + ENEMY_CONFIG[e.enemyId].goldReward;
          }, 0);
          var crystalDamage = enemies.filter(function (e) {
            return e.reachedCrystal;
          }).reduce(function (sum, e) {
            return sum + ENEMY_CONFIG[e.enemyId].crystalDamage;
          }, 0);
          return {
            crystalDamage: crystalDamage,
            killedEnemyIds: killedEnemyIds,
            goldFromKills: goldFromKills,
            healingDoneByUnit: healingDoneByUnit,
            killsByUnit: killsByUnit
          };
        };

        _proto.assignEngagements = function assignEngagements(units, enemies) {
          var _this2 = this;

          var engagements = new Map();
          var liveEnemies = enemies.filter(function (enemy) {
            return enemy.currentHp > 0 && !enemy.reachedCrystal;
          }).sort(function (a, b) {
            return b.distanceOnPath - a.distanceOnPath;
          });

          var _loop2 = function _loop2() {
            var lane = _arr[_i];
            var laneEnemies = liveEnemies.filter(function (enemy) {
              return enemy.lane === lane;
            });
            var blockers = units.filter(function (unit) {
              return unit.lane === lane && unit.currentHp > 0;
            }).filter(function (unit) {
              return UNIT_CONFIG[unit.unitId].aggroRole === 'blocker';
            }).sort(function (a, b) {
              return a.tileIndex - b.tileIndex;
            });

            var _loop3 = function _loop3() {
              var enemy = _step4.value;
              var blocker = blockers.find(function (unit) {
                return _this2.isEnemyInUnitAggroRange(enemy, unit);
              });

              if (blocker) {
                engagements.set(enemy.instanceId, blocker);
              }
            };

            for (var _iterator4 = _createForOfIteratorHelperLoose(laneEnemies), _step4; !(_step4 = _iterator4()).done;) {
              _loop3();
            }

            var meleeUnits = units.filter(function (unit) {
              return unit.lane === lane && unit.currentHp > 0;
            }).filter(function (unit) {
              return UNIT_CONFIG[unit.unitId].aggroRole === 'melee';
            }).sort(function (a, b) {
              return a.tileIndex - b.tileIndex;
            });

            var _loop4 = function _loop4() {
              var unit = _step5.value;
              var target = laneEnemies.find(function (enemy) {
                return !engagements.has(enemy.instanceId) && _this2.isEnemyInUnitAggroRange(enemy, unit);
              });

              if (target) {
                engagements.set(target.instanceId, unit);
              }
            };

            for (var _iterator5 = _createForOfIteratorHelperLoose(meleeUnits), _step5; !(_step5 = _iterator5()).done;) {
              _loop4();
            }
          };

          for (var _i = 0, _arr = [0, 1]; _i < _arr.length; _i++) {
            _loop2();
          }

          return engagements;
        };

        _proto.applyEnemyPressure = function applyEnemyPressure(engagements, dt) {
          var attackersByUnit = new Map();

          for (var _iterator6 = _createForOfIteratorHelperLoose(engagements.values()), _step6; !(_step6 = _iterator6()).done;) {
            var unit = _step6.value;

            if (unit.currentHp <= 0) {
              continue;
            }

            var current = attackersByUnit.get(unit.instanceId);

            if (current) {
              current.count += 1;
            } else {
              attackersByUnit.set(unit.instanceId, {
                unit: unit,
                count: 1
              });
            }
          }

          for (var _iterator7 = _createForOfIteratorHelperLoose(attackersByUnit.values()), _step7; !(_step7 = _iterator7()).done;) {
            var _step7$value = _step7.value,
                _unit = _step7$value.unit,
                count = _step7$value.count;
            _unit.currentHp -= count * this.enemyDpsPerUnit * dt;

            if (_unit.currentHp < 0) {
              _unit.currentHp = 0;
            }
          }
        };

        _proto.isEnemyInUnitAggroRange = function isEnemyInUnitAggroRange(enemy, unit) {
          var cfg = UNIT_CONFIG[unit.unitId];
          var distance = Math.abs(enemy.distanceOnPath - this.getUnitPathDistance(unit));
          return distance <= cfg.range;
        };

        _proto.getUnitPathDistance = function getUnitPathDistance(unit) {
          return this.firstTileDistance + unit.tileIndex * this.tileDistanceStep;
        };

        _proto.applyHeal = function applyHeal(caster, units) {
          var _UNIT_CONFIG$caster$u;

          var healAmount = ((_UNIT_CONFIG$caster$u = UNIT_CONFIG[caster.unitId].healPower) !== null && _UNIT_CONFIG$caster$u !== void 0 ? _UNIT_CONFIG$caster$u : 0) * caster.star;

          if (healAmount <= 0) {
            return 0;
          }

          var wounded = units.filter(function (unit) {
            return unit.lane === caster.lane && unit.currentHp > 0;
          }).map(function (unit) {
            var maxHp = UNIT_CONFIG[unit.unitId].maxHp;
            return {
              unit: unit,
              missingHp: Math.max(0, maxHp - unit.currentHp),
              hpRatio: unit.currentHp / maxHp
            };
          }).filter(function (entry) {
            return entry.missingHp > 0;
          }).sort(function (a, b) {
            return a.hpRatio - b.hpRatio;
          })[0];

          if (!wounded) {
            return 0;
          }

          var actualHeal = Math.min(healAmount, wounded.missingHp);
          wounded.unit.currentHp += actualHeal;
          return actualHeal;
        };

        return BattleSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/simulate-run.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './game-controller.ts'], function (exports) {
  'use strict';

  var _createForOfIteratorHelperLoose, cclegacy, GameController;

  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      GameController = module.GameController;
    }],
    execute: function () {
      exports('simulateBeginnerRun', simulateBeginnerRun);

      cclegacy._RF.push({}, "678c4YqmIFAZJrEf9r3qMcj", "simulate-run", undefined);

      function simulateBeginnerRun() {
        var controller = new GameController();
        controller.startGame('beginner');

        for (var safety = 0; safety < 200 && ['win', 'lose'].includes(controller.snapshot().phase) === false; safety += 1) {
          var prep = controller.snapshot();

          if (prep.phase === 'prep') {
            // 简单自动化策略：尽量买，优先铺满第一条路线。
            for (var i = 0; i < 3; i += 1) {
              controller.buy(0);
            }

            var bench = controller.snapshot().bench;

            for (var _iterator = _createForOfIteratorHelperLoose(bench), _step; !(_step = _iterator()).done;) {
              var unit = _step.value;
              var lane = prep.waveNumber % 2;

              for (var tile = 0; tile < 6; tile += 1) {
                if (controller.place(unit.instanceId, lane, tile)) {
                  break;
                }
              }
            }

            controller.beginBattle();
          }

          if (controller.snapshot().phase === 'battle') {
            for (var _i = 0; _i < 1000 && controller.snapshot().phase === 'battle'; _i += 1) {
              controller.tick(0.2);
            }
          }
        }

        return controller.snapshot();
      }

      if (typeof require !== 'undefined' && require.main === module) {
        console.log(JSON.stringify(simulateBeginnerRun(), null, 2));
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/game-session.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './unit-system.ts', './difficulty-config.ts', './battle-system.ts', './divine-task-system.ts', './economy-system.ts', './shop-system.ts', './wave-system.ts'], function (exports) {
  'use strict';

  var _createForOfIteratorHelperLoose, _defineProperty, cclegacy, UNIT_CONFIG, UnitSystem, DIFFICULTY_CONFIG, BattleSystem, DivineTaskSystem, EconomySystem, ShopSystem, WaveSystem;

  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      UnitSystem = module.UnitSystem;
    }, function (module) {
      DIFFICULTY_CONFIG = module.DIFFICULTY_CONFIG;
    }, function (module) {
      BattleSystem = module.BattleSystem;
    }, function (module) {
      DivineTaskSystem = module.DivineTaskSystem;
    }, function (module) {
      EconomySystem = module.EconomySystem;
    }, function (module) {
      ShopSystem = module.ShopSystem;
    }, function (module) {
      WaveSystem = module.WaveSystem;
    }],
    execute: function () {
      cclegacy._RF.push({}, "806224v8q9AUZUTGp0jh8YB", "game-session", undefined);

      var GameSession = exports('GameSession', /*#__PURE__*/function () {
        function GameSession() {
          _defineProperty(this, "economy", new EconomySystem());

          _defineProperty(this, "shop", new ShopSystem());

          _defineProperty(this, "unitSystem", new UnitSystem());

          _defineProperty(this, "divine", new DivineTaskSystem());

          _defineProperty(this, "waveSystem", new WaveSystem());

          _defineProperty(this, "battleSystem", new BattleSystem());

          _defineProperty(this, "phase", 'menu');

          _defineProperty(this, "difficulty", 'beginner');

          _defineProperty(this, "waveNumber", 1);

          _defineProperty(this, "crystalHp", 0);

          _defineProperty(this, "enemies", []);
        }

        var _proto = GameSession.prototype;

        _proto.startNewGame = function startNewGame(difficulty) {
          var diff = DIFFICULTY_CONFIG[difficulty];
          this.phase = 'prep';
          this.difficulty = difficulty;
          this.waveNumber = 1;
          this.crystalHp = diff.crystalHp;
          this.enemies = [];
          this.economy.setStartingGold(diff.startingGold);
          this.onRoundPrepStart();
        };

        _proto.getSnapshot = function getSnapshot() {
          return {
            phase: this.phase,
            difficulty: this.difficulty,
            waveNumber: this.waveNumber,
            totalWaves: DIFFICULTY_CONFIG[this.difficulty].totalWaves,
            crystalHp: this.crystalHp,
            gold: this.economy.getGold(),
            shop: this.shop.getEntries(),
            bench: this.unitSystem.getBenchUnits(),
            placed: this.unitSystem.getPlacedUnits(),
            divineTasks: this.divine.getAllProgress(),
            enemies: this.enemies
          };
        };

        _proto.refreshShopByCost = function refreshShopByCost() {
          if (this.phase !== 'prep') {
            return false;
          }

          var cost = DIFFICULTY_CONFIG[this.difficulty].refreshCost;

          if (!this.economy.spend(cost)) {
            return false;
          }

          this.shop.refresh();
          return true;
        };

        _proto.buyShopUnit = function buyShopUnit(slotIndex) {
          if (this.phase !== 'prep') {
            return false;
          }

          var unitId = this.shop.peek(slotIndex);
          if (!unitId) return false;
          var cost = UNIT_CONFIG[unitId].cost;

          if (!this.economy.spend(cost)) {
            return false;
          }

          this.shop.take(slotIndex);
          this.unitSystem.addToBench(unitId);
          return true;
        };

        _proto.placeUnit = function placeUnit(instanceId, lane, tileIndex) {
          if (this.phase !== 'prep') {
            return false;
          }

          return this.unitSystem.placeFromBench(instanceId, lane, tileIndex);
        };

        _proto.movePlacedUnit = function movePlacedUnit(instanceId, lane, tileIndex) {
          if (this.phase !== 'prep') {
            return false;
          }

          return this.unitSystem.movePlacedUnit(instanceId, lane, tileIndex);
        };

        _proto.beginBattle = function beginBattle() {
          if (this.phase !== 'prep') {
            return false;
          }

          this.phase = 'battle';
          this.enemies = [];
          this.waveSystem.resetWave();
          return true;
        };

        _proto.tickBattle = function tickBattle(dt) {
          var _this$enemies;

          if (dt === void 0) {
            dt = 0.2;
          }

          if (this.phase !== 'battle') return;
          var spawned = this.waveSystem.tickSpawn(this.difficulty, this.waveNumber, dt);

          (_this$enemies = this.enemies).push.apply(_this$enemies, spawned);

          var result = this.battleSystem.tick(this.unitSystem.getPlacedUnits(), this.enemies, dt);
          this.crystalHp -= result.crystalDamage;
          this.economy.earn(result.goldFromKills);

          for (var _i = 0, _Object$entries = Object.entries(result.killsByUnit); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = _Object$entries[_i],
                unitId = _Object$entries$_i[0],
                killCount = _Object$entries$_i[1];
            this.divine.addMetric(unitId, 'kills', killCount);
            var completed = this.divine.resolveCompleted(unitId);

            if (completed) {
              this.unitSystem.evolveUnit(unitId, completed.targetUnitId);
            }
          }

          for (var _i2 = 0, _Object$entries2 = Object.entries(result.healingDoneByUnit); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _Object$entries2[_i2],
                _unitId = _Object$entries2$_i[0],
                healAmount = _Object$entries2$_i[1];
            this.divine.addMetric(_unitId, 'healing', healAmount);

            var _completed = this.divine.resolveCompleted(_unitId);

            if (_completed) {
              this.unitSystem.evolveUnit(_unitId, _completed.targetUnitId);
            }
          }

          var removedIds = new Set([].concat(result.killedEnemyIds, this.enemies.filter(function (e) {
            return e.reachedCrystal;
          }).map(function (e) {
            return e.instanceId;
          })));
          this.enemies = this.enemies.filter(function (e) {
            return !removedIds.has(e.instanceId);
          });

          if (this.crystalHp <= 0) {
            this.phase = 'lose';
            return;
          }

          var spawnDone = this.waveSystem.isWaveSpawnFinished(this.difficulty, this.waveNumber);

          if (spawnDone && this.enemies.length === 0) {
            if (this.waveNumber >= DIFFICULTY_CONFIG[this.difficulty].totalWaves) {
              this.phase = 'win';
            } else {
              this.waveNumber += 1;
              this.phase = 'prep';
              this.onRoundPrepStart();
            }
          }
        };

        _proto.onRoundPrepStart = function onRoundPrepStart() {
          this.unitSystem.resetDefeatedPlacedUnits();
          this.shop.refresh();

          for (var _iterator = _createForOfIteratorHelperLoose(this.unitSystem.getUnitsForTaskRoll()), _step; !(_step = _iterator()).done;) {
            var unit = _step.value;
            var progress = this.divine.tryAssignTask(unit);

            if (progress) {
              this.unitSystem.setAssignedTask(unit.instanceId, progress.taskId);
            }
          }
        };

        return GameSession;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/wave-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "99533lTHJZDhKZtQM++rZPl", "wave-config", undefined);

      var PATTERNS = [[{
        enemyId: 'slime',
        count: 8,
        spawnInterval: 0.8
      }], [{
        enemyId: 'slime',
        count: 10,
        spawnInterval: 0.75
      }], [{
        enemyId: 'slime',
        count: 6,
        spawnInterval: 0.7
      }, {
        enemyId: 'wolf',
        count: 4,
        spawnInterval: 1
      }], [{
        enemyId: 'wolf',
        count: 8,
        spawnInterval: 0.9
      }], [{
        enemyId: 'wolf',
        count: 10,
        spawnInterval: 0.85
      }, {
        enemyId: 'slime',
        count: 6,
        spawnInterval: 0.7
      }], [{
        enemyId: 'brute',
        count: 3,
        spawnInterval: 1.6
      }, {
        enemyId: 'wolf',
        count: 8,
        spawnInterval: 0.85
      }], [{
        enemyId: 'brute',
        count: 5,
        spawnInterval: 1.3
      }], [{
        enemyId: 'brute',
        count: 6,
        spawnInterval: 1.15
      }, {
        enemyId: 'wolf',
        count: 10,
        spawnInterval: 0.8
      }]];

      function scaleEntry(entry, scale) {
        return {
          enemyId: entry.enemyId,
          count: Math.max(1, Math.floor(entry.count * scale)),
          spawnInterval: Math.max(0.35, entry.spawnInterval / Math.min(2, scale))
        };
      }

      function buildWaves(totalWaves, multiplier) {
        var waves = [];

        var _loop = function _loop(i) {
          var pattern = PATTERNS[(i - 1) % PATTERNS.length];
          var scale = 1 + Math.floor((i - 1) / PATTERNS.length) * 0.18 + multiplier;
          waves.push({
            waveNumber: i,
            entries: pattern.map(function (entry) {
              return scaleEntry(entry, scale);
            })
          });
        };

        for (var i = 1; i <= totalWaves; i += 1) {
          _loop(i);
        }

        return waves;
      }

      var WAVE_CONFIG = exports('WAVE_CONFIG', {
        beginner: buildWaves(10, 0),
        normal: buildWaves(30, 0.2),
        hard: buildWaves(60, 0.45)
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/game-controller.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './game-session.ts'], function (exports) {
  'use strict';

  var _defineProperty, cclegacy, GameSession;

  return {
    setters: [function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      GameSession = module.GameSession;
    }],
    execute: function () {
      cclegacy._RF.push({}, "9a78d143UJBhZl8KpY1LBt6", "game-controller", undefined);
      /**
       * Cocos Creator 接入建议：
       * 1. 将该控制器挂在主场景节点上。
       * 2. 将按钮事件绑定到 startGame/refreshShop/buy/place/movePlaced/beginBattle。
       * 3. 在 update(dt) 中调用 tick。
       */


      var GameController = exports('GameController', /*#__PURE__*/function () {
        function GameController() {
          _defineProperty(this, "session", new GameSession());
        }

        var _proto = GameController.prototype;

        _proto.startGame = function startGame(difficulty) {
          this.session.startNewGame(difficulty);
        };

        _proto.refreshShop = function refreshShop() {
          return this.session.refreshShopByCost();
        };

        _proto.buy = function buy(slotIndex) {
          return this.session.buyShopUnit(slotIndex);
        };

        _proto.place = function place(instanceId, lane, tileIndex) {
          return this.session.placeUnit(instanceId, lane, tileIndex);
        };

        _proto.movePlaced = function movePlaced(instanceId, lane, tileIndex) {
          return this.session.movePlacedUnit(instanceId, lane, tileIndex);
        };

        _proto.beginBattle = function beginBattle() {
          return this.session.beginBattle();
        };

        _proto.tick = function tick(dt) {
          this.session.tickBattle(dt);
        };

        _proto.snapshot = function snapshot() {
          return this.session.getSnapshot();
        };

        return GameController;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/types.ts", ['cc'], function () {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "9cff3BMcixIsaA4IV+FsHdd", "types", undefined);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/id.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('nextId', nextId);

      cclegacy._RF.push({}, "cf91dmKjNlCwZeqk4O0iNzw", "id", undefined);

      var idSeed = 1;

      function nextId(prefix) {
        var id = prefix + "_" + idSeed;
        idSeed += 1;
        return id;
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/wave-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './id.ts', './enemy-config.ts', './wave-config.ts'], function (exports) {
  'use strict';

  var _defineProperty, cclegacy, nextId, ENEMY_CONFIG, WAVE_CONFIG;

  return {
    setters: [function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      nextId = module.nextId;
    }, function (module) {
      ENEMY_CONFIG = module.ENEMY_CONFIG;
    }, function (module) {
      WAVE_CONFIG = module.WAVE_CONFIG;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d4d0cS9AZNNDaY+CRVKB1yh", "wave-system", undefined);

      var WaveSystem = exports('WaveSystem', /*#__PURE__*/function () {
        function WaveSystem() {
          _defineProperty(this, "cursor", {
            entryIndex: 0,
            spawnCooldown: 0,
            spawnedInCurrentEntry: 0
          });
        }

        var _proto = WaveSystem.prototype;

        _proto.resetWave = function resetWave() {
          this.cursor = {
            entryIndex: 0,
            spawnCooldown: 0,
            spawnedInCurrentEntry: 0
          };
        };

        _proto.tickSpawn = function tickSpawn(difficulty, waveNumber, dt) {
          var wave = WAVE_CONFIG[difficulty][waveNumber - 1];

          if (!wave) {
            return [];
          }

          var spawned = [];
          this.cursor.spawnCooldown -= dt;

          while (this.cursor.spawnCooldown <= 0) {
            var entry = wave.entries[this.cursor.entryIndex];

            if (!entry) {
              break;
            }

            var lane = this.cursor.spawnedInCurrentEntry % 2;
            var config = ENEMY_CONFIG[entry.enemyId];
            spawned.push({
              instanceId: nextId('enemy'),
              enemyId: entry.enemyId,
              currentHp: config.maxHp,
              lane: lane,
              distanceOnPath: 0,
              reachedCrystal: false
            });
            this.cursor.spawnedInCurrentEntry += 1;
            this.cursor.spawnCooldown += entry.spawnInterval;

            if (this.cursor.spawnedInCurrentEntry >= entry.count) {
              this.cursor.entryIndex += 1;
              this.cursor.spawnedInCurrentEntry = 0;
            }
          }

          return spawned;
        };

        _proto.isWaveSpawnFinished = function isWaveSpawnFinished(difficulty, waveNumber) {
          var wave = WAVE_CONFIG[difficulty][waveNumber - 1];
          return !wave || this.cursor.entryIndex >= wave.entries.length;
        };

        return WaveSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/divine-task-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d911cF1RtdGMoK8gB7z2uxX", "divine-task-config", undefined);

      var DIVINE_TASK_CONFIG = exports('DIVINE_TASK_CONFIG', {
        warrior_to_berserker: {
          id: 'warrior_to_berserker',
          sourceUnitId: 'warrior',
          targetUnitId: 'berserker',
          triggerChance: 0.1,
          metric: 'kills',
          requirement: 1000
        },
        priest_to_light_mage: {
          id: 'priest_to_light_mage',
          sourceUnitId: 'priest',
          targetUnitId: 'light_mage',
          triggerChance: 0.1,
          metric: 'healing',
          requirement: 100000
        }
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/difficulty-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "dcb33RdMOJIv6hC0TtdqQst", "difficulty-config", undefined);

      var DIFFICULTY_CONFIG = exports('DIFFICULTY_CONFIG', {
        beginner: {
          id: 'beginner',
          name: '新手',
          totalWaves: 10,
          startingGold: 16,
          refreshCost: 2,
          crystalHp: 20
        },
        normal: {
          id: 'normal',
          name: '普通',
          totalWaves: 30,
          startingGold: 20,
          refreshCost: 2,
          crystalHp: 25
        },
        hard: {
          id: 'hard',
          name: '困难',
          totalWaves: 60,
          startingGold: 24,
          refreshCost: 3,
          crystalHp: 30
        }
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/shop-system.ts", ['./_rollupPluginModLoBabelHelpers.js', 'cc', './unit-config.ts', './random.ts'], function (exports) {
  'use strict';

  var _defineProperty, cclegacy, SHOP_UNIT_POOL, pickN;

  return {
    setters: [function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      SHOP_UNIT_POOL = module.SHOP_UNIT_POOL;
    }, function (module) {
      pickN = module.pickN;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ee9f9o+pp5DxKm5XCeOMkjm", "shop-system", undefined);

      var ShopSystem = exports('ShopSystem', /*#__PURE__*/function () {
        function ShopSystem() {
          _defineProperty(this, "entries", []);
        }

        var _proto = ShopSystem.prototype;

        _proto.refresh = function refresh() {
          this.entries = pickN(SHOP_UNIT_POOL, 3);
          return [].concat(this.entries);
        };

        _proto.getEntries = function getEntries() {
          return [].concat(this.entries);
        };

        _proto.peek = function peek(slotIndex) {
          if (slotIndex < 0 || slotIndex >= this.entries.length) {
            return null;
          }

          return this.entries[slotIndex];
        };

        _proto.take = function take(slotIndex) {
          if (slotIndex < 0 || slotIndex >= this.entries.length) {
            return null;
          }

          var unitId = this.entries[slotIndex];
          this.entries.splice(slotIndex, 1);
          return unitId;
        };

        return ShopSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main-menu-controller.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ef826U8Zy5LXq+OBSRUaYEh", "main-menu-controller", undefined);

      var MainMenuController = exports('MainMenuController', /*#__PURE__*/function () {
        function MainMenuController() {}

        var _proto = MainMenuController.prototype;

        _proto.onSelectDifficulty = function onSelectDifficulty(cb, difficulty) {
          cb(difficulty);
        };

        return MainMenuController;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./unit-config.ts', './id.ts', './unit-system.ts', './difficulty-config.ts', './divine-task-config.ts', './enemy-config.ts', './battle-system.ts', './random.ts', './divine-task-system.ts', './economy-system.ts', './shop-system.ts', './wave-config.ts', './wave-system.ts', './game-session.ts', './game-controller.ts', './cocos-game-controller.ts', './verify-divine-task-rules.ts', './simulate-run.ts', './types.ts', './main-menu-controller.ts'], function () {
  'use strict';

  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});
System.register("chunks:///_virtual/math.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        clamp: clamp,
        distance: distance,
        normalize: normalize
      });

      cclegacy._RF.push({}, "01db0Jj+PpLKru1EiCtOU40", "math", undefined);

      function distance(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.hypot(dx, dy);
      }

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

      function normalize(from, to) {
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        var len = Math.hypot(dx, dy) || 1;
        return {
          x: dx / len,
          y: dy / len
        };
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/collision-system.ts", ['cc', './math.ts', './_rollupPluginModLoBabelHelpers.js', './squad-battle-config.ts'], function (exports) {
  'use strict';

  var cclegacy, distance, clamp, _createForOfIteratorHelperLoose, SQUAD_BATTLEFIELD;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
      clamp = module.clamp;
    }, function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      SQUAD_BATTLEFIELD = module.SQUAD_BATTLEFIELD;
    }],
    execute: function () {
      cclegacy._RF.push({}, "0a24aYmIfpH4ppirvig/EF1", "collision-system", undefined);

      var CollisionSystem = exports('CollisionSystem', /*#__PURE__*/function () {
        function CollisionSystem() {}

        var _proto = CollisionSystem.prototype;

        _proto.resolve = function resolve(allies, enemies, iterations) {
          var _this = this;

          if (iterations === void 0) {
            iterations = 2;
          }

          var aliveAllies = allies.filter(function (ally) {
            return ally.alive;
          });
          var aliveEnemies = enemies.filter(function (enemy) {
            return enemy.alive;
          });

          for (var i = 0; i < iterations; i += 1) {
            this.resolveGroupCollisions(aliveAllies.map(function (ally) {
              return {
                position: ally.position,
                radius: _this.getAllyRadius(ally),
                weight: ally.role === 'melee' ? 0.85 : 1
              };
            }));
            this.resolveGroupCollisions(aliveEnemies.map(function (enemy) {
              return {
                position: enemy.position,
                radius: _this.getEnemyRadius(enemy),
                weight: enemy.enemyType === 'boss' ? 0.55 : enemy.enemyType === 'brute' ? 0.72 : 1
              };
            }));
            this.resolveSideVsSide(aliveAllies, aliveEnemies);
            this.clampAll(aliveAllies, aliveEnemies);
          }
        };

        _proto.resolveGroupCollisions = function resolveGroupCollisions(colliders) {
          for (var i = 0; i < colliders.length; i += 1) {
            for (var j = i + 1; j < colliders.length; j += 1) {
              this.separate(colliders[i], colliders[j]);
            }
          }
        };

        _proto.resolveSideVsSide = function resolveSideVsSide(allies, enemies) {
          for (var _iterator = _createForOfIteratorHelperLoose(allies), _step; !(_step = _iterator()).done;) {
            var ally = _step.value;

            for (var _iterator2 = _createForOfIteratorHelperLoose(enemies), _step2; !(_step2 = _iterator2()).done;) {
              var enemy = _step2.value;
              this.separate({
                position: ally.position,
                radius: this.getAllyRadius(ally),
                weight: ally.role === 'melee' ? 0.82 : 1
              }, {
                position: enemy.position,
                radius: this.getEnemyRadius(enemy),
                weight: enemy.enemyType === 'boss' ? 0.5 : enemy.enemyType === 'brute' ? 0.68 : 0.92
              });
            }
          }
        };

        _proto.separate = function separate(a, b) {
          var minDist = a.radius + b.radius;
          var dist = distance(a.position, b.position);
          if (dist >= minDist) return;
          var overlap = minDist - Math.max(0.001, dist);
          var nx = dist > 0.001 ? (b.position.x - a.position.x) / dist : 1;
          var ny = dist > 0.001 ? (b.position.y - a.position.y) / dist : 0;
          var totalWeight = a.weight + b.weight;
          var aShare = totalWeight > 0 ? b.weight / totalWeight : 0.5;
          var bShare = totalWeight > 0 ? a.weight / totalWeight : 0.5;
          var push = overlap * 0.52;
          a.position.x -= nx * push * aShare;
          a.position.y -= ny * push * aShare;
          b.position.x += nx * push * bShare;
          b.position.y += ny * push * bShare;
        };

        _proto.clampAll = function clampAll(allies, enemies) {
          for (var _iterator3 = _createForOfIteratorHelperLoose(allies), _step3; !(_step3 = _iterator3()).done;) {
            var ally = _step3.value;
            var radius = this.getAllyRadius(ally);
            ally.position.x = clamp(ally.position.x, radius, SQUAD_BATTLEFIELD.width - radius);
            ally.position.y = clamp(ally.position.y, radius, SQUAD_BATTLEFIELD.height - radius);
          }

          for (var _iterator4 = _createForOfIteratorHelperLoose(enemies), _step4; !(_step4 = _iterator4()).done;) {
            var enemy = _step4.value;

            var _radius = this.getEnemyRadius(enemy);

            enemy.position.x = clamp(enemy.position.x, _radius, SQUAD_BATTLEFIELD.width - _radius);
            enemy.position.y = clamp(enemy.position.y, _radius, SQUAD_BATTLEFIELD.height - _radius);
          }
        };

        _proto.getAllyRadius = function getAllyRadius(ally) {
          if (ally.role === 'melee') return 26;
          if (ally.role === 'priest') return 22;
          return 20;
        };

        _proto.getEnemyRadius = function getEnemyRadius(enemy) {
          if (enemy.enemyType === 'boss') return 34;
          if (enemy.enemyType === 'brute') return 28;
          return 20;
        };

        return CollisionSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/art-resource-manifest.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _extends;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _extends = module.extends;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1cebb5b1GRBzYWjqecMeqG1", "art-resource-manifest", undefined);

      var unitDir = function unitDir(directory, unitId) {
        return {
          unitId: unitId,
          directory: directory,
          stars: {
            1: unitId + "_star1.png",
            2: unitId + "_star2.png",
            3: unitId + "_star3.png"
          }
        };
      };

      var ART_RESOURCE_MANIFEST = exports('ART_RESOURCE_MANIFEST', {
        units: {
          warrior: _extends({}, unitDir('assets/resources/textures/units/warrior', 'warrior'), {
            divineOverride: 'berserker_divine.png',
            portrait: 'warrior_portrait.png'
          }),
          mage: _extends({}, unitDir('assets/resources/textures/units/mage', 'mage'), {
            portrait: 'mage_portrait.png'
          }),
          priest: _extends({}, unitDir('assets/resources/textures/units/priest', 'priest'), {
            divineOverride: 'light_mage_divine.png',
            portrait: 'priest_portrait.png'
          }),
          archer: _extends({}, unitDir('assets/resources/textures/units/archer', 'archer'), {
            portrait: 'archer_portrait.png'
          }),
          shield_guard: _extends({}, unitDir('assets/resources/textures/units/shield_guard', 'shield_guard'), {
            portrait: 'shield_guard_portrait.png'
          }),
          cavalry: _extends({}, unitDir('assets/resources/textures/units/cavalry', 'cavalry'), {
            portrait: 'cavalry_portrait.png'
          }),
          spearman: _extends({}, unitDir('assets/resources/textures/units/spearman', 'spearman'), {
            portrait: 'spearman_portrait.png'
          }),
          berserker: {
            unitId: 'berserker',
            directory: 'assets/resources/textures/units/warrior',
            divineOverride: 'berserker_divine.png'
          },
          light_mage: {
            unitId: 'light_mage',
            directory: 'assets/resources/textures/units/priest',
            divineOverride: 'light_mage_divine.png'
          }
        },
        enemies: {
          grunt: 'assets/resources/textures/enemies/grunt.png',
          brute: 'assets/resources/textures/enemies/brute.png',
          boss: 'assets/resources/textures/enemies/boss.png'
        },
        optionalEnemies: ['assets/art/enemies/boss_1.png'],
        uiIcons: ['assets/resources/textures/ui/gold.png', 'assets/art/ui/icons/refresh.png', 'assets/art/ui/icons/sell.png', 'assets/art/ui/icons/start_wave.png', 'assets/art/ui/icons/star_1.png', 'assets/art/ui/icons/star_2.png', 'assets/art/ui/icons/star_3.png'],
        backgrounds: ['assets/art/backgrounds/battlefield_01.png']
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/squad-battle-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1d1eaExWTJLK7glY2nh31hn", "squad-battle-config", undefined);

      var SQUAD_BATTLEFIELD = exports('SQUAD_BATTLEFIELD', {
        width: 1200,
        height: 700,
        centerLineX: 520,
        centerLineY: 350,
        allySpawnGapY: 92,
        rightSpawnX: 1120,
        leftSpawnX: 80,
        spawnYMin: 120,
        spawnYMax: 580
      });
      var SQUAD_UNIT_STATS = exports('SQUAD_UNIT_STATS', {
        warrior: {
          maxHp: 420,
          attackDamage: 40,
          attackInterval: 1.2,
          moveSpeed: 120,
          attackRange: 48,
          reactionRange: 180
        },
        berserker: {
          maxHp: 500,
          attackDamage: 65,
          attackInterval: 0.9,
          moveSpeed: 140,
          attackRange: 54,
          reactionRange: 210
        },
        shield_guard: {
          maxHp: 650,
          attackDamage: 28,
          attackInterval: 1.6,
          moveSpeed: 95,
          attackRange: 46,
          reactionRange: 165
        },
        cavalry: {
          maxHp: 440,
          attackDamage: 48,
          attackInterval: 1.25,
          moveSpeed: 155,
          attackRange: 52,
          reactionRange: 220
        },
        spearman: {
          maxHp: 390,
          attackDamage: 45,
          attackInterval: 1.35,
          moveSpeed: 115,
          attackRange: 165,
          reactionRange: 180
        },
        archer: {
          maxHp: 310,
          attackDamage: 38,
          attackInterval: 0.95,
          moveSpeed: 90,
          attackRange: 270,
          reactionRange: 270
        },
        mage: {
          maxHp: 300,
          attackDamage: 46,
          attackInterval: 1.45,
          moveSpeed: 85,
          attackRange: 255,
          reactionRange: 255
        },
        light_mage: {
          maxHp: 340,
          attackDamage: 58,
          attackInterval: 1.25,
          moveSpeed: 95,
          attackRange: 270,
          reactionRange: 270
        },
        priest: {
          maxHp: 290,
          attackDamage: 0,
          attackInterval: 0.7,
          moveSpeed: 100,
          attackRange: 190,
          reactionRange: 0,
          healPower: 30
        }
      });
      var SQUAD_ROLE_MAP = exports('SQUAD_ROLE_MAP', {
        warrior: 'melee',
        berserker: 'melee',
        shield_guard: 'melee',
        cavalry: 'melee',
        spearman: 'ranged',
        archer: 'ranged',
        mage: 'ranged',
        light_mage: 'ranged',
        priest: 'priest'
      });
      var ENEMY_STATS = exports('ENEMY_STATS', {
        grunt: {
          maxHp: 210,
          attackDamage: 28,
          attackInterval: 1.4,
          moveSpeed: 105,
          attackRange: 45
        },
        brute: {
          maxHp: 420,
          attackDamage: 42,
          attackInterval: 1.65,
          moveSpeed: 85,
          attackRange: 52
        },
        boss: {
          maxHp: 1800,
          attackDamage: 90,
          attackInterval: 2,
          moveSpeed: 90,
          attackRange: 62
        }
      });
      var DEFAULT_WAVES = exports('DEFAULT_WAVES', [{
        waveNumber: 1,
        enemies: [{
          enemyType: 'grunt',
          count: 6
        }]
      }, {
        waveNumber: 2,
        enemies: [{
          enemyType: 'grunt',
          count: 4
        }, {
          enemyType: 'brute',
          count: 2
        }]
      }, {
        waveNumber: 3,
        enemies: [{
          enemyType: 'boss',
          count: 1
        }, {
          enemyType: 'grunt',
          count: 4
        }]
      }]);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/divine-task-system.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './divine-task-config.ts', './unit-config.ts', './random.ts'], function (exports) {
  'use strict';

  var cclegacy, _extends, _defineProperty, DIVINE_TASK_CONFIG, UNIT_CONFIG, chance;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _extends = module.extends;
      _defineProperty = module.defineProperty;
    }, function (module) {
      DIVINE_TASK_CONFIG = module.DIVINE_TASK_CONFIG;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
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

        _proto.setAllProgress = function setAllProgress(progresses) {
          this.progresses = progresses.map(function (progress) {
            return _extends({}, progress);
          });
        };

        return DivineTaskSystem;
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
      cclegacy._RF.push({}, "2fc558lublI5IrhWRtjKCD5", "types", undefined);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/battle-hud-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './sprite-resolvers.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Vec3, Color, Node, Label, Sprite, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, UiIconResolver;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      Color = module.Color;
      Node = module.Node;
      Label = module.Label;
      Sprite = module.Sprite;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      UiIconResolver = module.UiIconResolver;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "3089aowgUdDfKlmBBsabJOk", "battle-hud-controller", undefined);

      var ccclass = _decorator.ccclass;
      var BattleHudController = exports('BattleHudController', (_dec = ccclass('BattleHudController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BattleHudController, _Component);

        function BattleHudController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "iconResolver", new UiIconResolver());

          _defineProperty(_assertThisInitialized(_this), "topLabel", null);

          _defineProperty(_assertThisInitialized(_this), "goldLabel", null);

          _defineProperty(_assertThisInitialized(_this), "statusLabel", null);

          _defineProperty(_assertThisInitialized(_this), "taskLabel", null);

          _defineProperty(_assertThisInitialized(_this), "noticeLabel", null);

          return _this;
        }

        var _proto = BattleHudController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(920, 150);
          this.topLabel = this.createLabel('Top', new Vec3(-420, 52, 0), 15, new Color(226, 232, 240, 255));
          this.goldLabel = this.createGoldReadout();
          this.statusLabel = this.createLabel('Status', new Vec3(-420, 18, 0), 13, new Color(251, 191, 36, 255));
          this.taskLabel = this.createLabel('Task', new Vec3(-420, -16, 0), 12, new Color(191, 219, 254, 255));
          this.noticeLabel = this.createLabel('Notice', new Vec3(-420, -50, 0), 12, new Color(134, 239, 172, 255));
        };

        _proto.render = function render(snapshot, selected, notice) {
          if (!this.topLabel || !this.goldLabel || !this.statusLabel || !this.taskLabel || !this.noticeLabel) return;
          this.topLabel.string = "\u9636\u6BB5 " + snapshot.phase + " \xB7 \u6CE2\u6B21 " + snapshot.currentWave + "/" + snapshot.totalWaves + " \xB7 \u4E0A\u9635 " + snapshot.deployed.length + "/" + snapshot.slotConfig.deployed + " \xB7 \u5907\u6218 " + snapshot.bench.length + "/" + snapshot.slotConfig.bench;
          this.goldLabel.string = "" + snapshot.gold;
          this.statusLabel.string = "\u5F53\u524D\u9009\u62E9\uFF1A" + (selected !== null && selected !== void 0 ? selected : '未选择') + " \xB7 " + (snapshot.phase === 'prep' ? '准备阶段可调整阵容' : '战斗阶段可持续下达命令');
          this.taskLabel.string = snapshot.divineTasks.length > 0 ? "\u795E\u54C1\u8FDB\u5EA6\uFF1A" + snapshot.divineTasks.map(function (task) {
            var _task$divineTaskId, _task$divineProgress;

            return task.unitInstanceId.slice(-4) + ":" + ((_task$divineTaskId = task.divineTaskId) !== null && _task$divineTaskId !== void 0 ? _task$divineTaskId : '-') + "(" + Math.floor((_task$divineProgress = task.divineProgress) !== null && _task$divineProgress !== void 0 ? _task$divineProgress : 0) + ")";
          }).join(' | ') : '神品进度：none';
          this.noticeLabel.string = notice;
        };

        _proto.createLabel = function createLabel(name, position, fontSize, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(position);
          node.addComponent(UITransform).setContentSize(860, 28);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 6;
          label.color = color;
          return label;
        };

        _proto.createGoldReadout = function createGoldReadout() {
          var _label$node$getCompon;

          var iconNode = new Node('GoldIcon');
          iconNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(iconNode);
          iconNode.setPosition(new Vec3(150, 52, 0));
          iconNode.addComponent(UITransform).setContentSize(24, 24);
          var sprite = iconNode.addComponent(Sprite);
          sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          sprite.color = new Color(245, 158, 11, 255);
          void this.iconResolver.resolve('gold').then(function (frame) {
            if (!frame || !sprite.node.parent) return;
            sprite.spriteFrame = frame;
            sprite.color = new Color(255, 255, 255, 255);
          });
          var label = this.createLabel('GoldValue', new Vec3(172, 52, 0), 15, new Color(254, 240, 138, 255));
          (_label$node$getCompon = label.node.getComponent(UITransform)) === null || _label$node$getCompon === void 0 ? void 0 : _label$node$getCompon.setContentSize(90, 28);
          return label;
        };

        return BattleHudController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/squad-battle-session.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './squad-battle-config.ts', './collision-system.ts', './unit-config.ts', './divine-task-system.ts', './difficulty-config.ts', './economy-system.ts', './squad-ui-layout-config.ts', './shop-system.ts', './id.ts', './attack-system.ts', './enemy-ai-system.ts', './healing-system.ts', './movement-system.ts', './roster-system.ts', './targeting-system.ts', './unit-command-system.ts'], function (exports) {
  'use strict';

  var cclegacy, _extends, _createForOfIteratorHelperLoose, _defineProperty, SQUAD_ROLE_MAP, SQUAD_BATTLEFIELD, ENEMY_STATS, SQUAD_UNIT_STATS, DEFAULT_WAVES, CollisionSystem, UNIT_CONFIG, DivineTaskSystem, DIFFICULTY_CONFIG, EconomySystem, SQUAD_DEPLOY_SLOTS, SQUAD_BENCH_SLOTS, SQUAD_SHOP_SLOTS, ShopSystem, syncIdSeedFromIds, nextId, AttackSystem, EnemyAiSystem, HealingSystem, MovementSystem, RosterSystem, TargetingSystem, UnitCommandSystem;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _defineProperty = module.defineProperty;
    }, function (module) {
      SQUAD_ROLE_MAP = module.SQUAD_ROLE_MAP;
      SQUAD_BATTLEFIELD = module.SQUAD_BATTLEFIELD;
      ENEMY_STATS = module.ENEMY_STATS;
      SQUAD_UNIT_STATS = module.SQUAD_UNIT_STATS;
      DEFAULT_WAVES = module.DEFAULT_WAVES;
    }, function (module) {
      CollisionSystem = module.CollisionSystem;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      DivineTaskSystem = module.DivineTaskSystem;
    }, function (module) {
      DIFFICULTY_CONFIG = module.DIFFICULTY_CONFIG;
    }, function (module) {
      EconomySystem = module.EconomySystem;
    }, function (module) {
      SQUAD_DEPLOY_SLOTS = module.SQUAD_DEPLOY_SLOTS;
      SQUAD_BENCH_SLOTS = module.SQUAD_BENCH_SLOTS;
      SQUAD_SHOP_SLOTS = module.SQUAD_SHOP_SLOTS;
    }, function (module) {
      ShopSystem = module.ShopSystem;
    }, function (module) {
      syncIdSeedFromIds = module.syncIdSeedFromIds;
      nextId = module.nextId;
    }, function (module) {
      AttackSystem = module.AttackSystem;
    }, function (module) {
      EnemyAiSystem = module.EnemyAiSystem;
    }, function (module) {
      HealingSystem = module.HealingSystem;
    }, function (module) {
      MovementSystem = module.MovementSystem;
    }, function (module) {
      RosterSystem = module.RosterSystem;
    }, function (module) {
      TargetingSystem = module.TargetingSystem;
    }, function (module) {
      UnitCommandSystem = module.UnitCommandSystem;
    }],
    execute: function () {
      cclegacy._RF.push({}, "31730yWd8ZIJbC5e2HQtTEM", "squad-battle-session", undefined);

      var SquadBattleSession = exports('SquadBattleSession', /*#__PURE__*/function () {
        function SquadBattleSession(waves) {
          if (waves === void 0) {
            waves = DEFAULT_WAVES;
          }

          _defineProperty(this, "onVictory", void 0);

          _defineProperty(this, "commandSystem", new UnitCommandSystem());

          _defineProperty(this, "movementSystem", new MovementSystem());

          _defineProperty(this, "targetingSystem", new TargetingSystem());

          _defineProperty(this, "attackSystem", new AttackSystem());

          _defineProperty(this, "healingSystem", new HealingSystem());

          _defineProperty(this, "enemyAiSystem", new EnemyAiSystem());

          _defineProperty(this, "collisionSystem", new CollisionSystem());

          _defineProperty(this, "selectedStarterUnitId", void 0);

          _defineProperty(this, "roster", new RosterSystem());

          _defineProperty(this, "economy", new EconomySystem());

          _defineProperty(this, "shop", new ShopSystem());

          _defineProperty(this, "divine", new DivineTaskSystem());

          _defineProperty(this, "phase", 'prep');

          _defineProperty(this, "difficulty", 'beginner');

          _defineProperty(this, "waveNumber", 1);

          _defineProperty(this, "waves", void 0);

          _defineProperty(this, "allies", []);

          _defineProperty(this, "enemies", []);

          _defineProperty(this, "pendingBattleStart", false);

          _defineProperty(this, "uiState", {
            prepPanel: 'visible',
            battlefieldLighting: 'dim',
            transitionProgress: 1,
            nextWaveReady: true
          });

          this.waves = waves;
        }

        var _proto = SquadBattleSession.prototype;

        _proto.startNewRun = function startNewRun(difficulty, starterUnitId) {
          if (difficulty === void 0) {
            difficulty = 'beginner';
          }

          this.phase = 'prep';
          this.difficulty = difficulty;
          this.selectedStarterUnitId = starterUnitId;
          this.waveNumber = 1;
          this.allies = [];
          this.enemies = [];
          this.roster.reset();
          this.divine = new DivineTaskSystem();
          this.economy.setStartingGold(DIFFICULTY_CONFIG[difficulty].startingGold);
          this.shop.refresh();

          if (starterUnitId) {
            this.roster.addToBenchWithState({
              unitId: starterUnitId,
              star: 1,
              isCaptain: true
            });
          }

          this.pendingBattleStart = false;
          this.uiState = {
            prepPanel: 'visible',
            battlefieldLighting: 'dim',
            transitionProgress: 1,
            nextWaveReady: true
          };
        };

        _proto.refreshShopByCost = function refreshShopByCost() {
          if (this.phase !== 'prep') return false;
          var cost = DIFFICULTY_CONFIG[this.difficulty].refreshCost;
          if (!this.economy.spend(cost)) return false;
          this.shop.refresh();
          return true;
        };

        _proto.buyShopUnit = function buyShopUnit(slotIndex) {
          if (this.phase !== 'prep') return false;
          var unitId = this.shop.peek(slotIndex);
          if (!unitId) return false;
          var cost = UNIT_CONFIG[unitId].cost;
          if (!this.economy.spend(cost)) return false;
          var bought = this.roster.addToBench(unitId);

          if (!bought) {
            this.economy.earn(cost);
            return false;
          }

          this.shop.take(slotIndex);
          return true;
        };

        _proto.deployFromBench = function deployFromBench(instanceId) {
          if (this.phase !== 'prep') return false;
          return this.roster.deploy(instanceId);
        };

        _proto.recallFromDeployed = function recallFromDeployed(instanceId) {
          if (this.phase !== 'prep') return false;
          return this.roster.recall(instanceId);
        };

        _proto.startBattle = function startBattle() {
          if (this.phase !== 'prep') return false;
          if (this.pendingBattleStart) return false;
          if (this.roster.getDeployCount() === 0) return false;
          this.uiState = {
            prepPanel: 'falling',
            battlefieldLighting: 'brightening',
            transitionProgress: 0,
            nextWaveReady: false
          };
          this.pendingBattleStart = true;
          return true;
        };

        _proto.startNextWaveFromPrep = function startNextWaveFromPrep() {
          return this.startBattle();
        };

        _proto.tick = function tick(dt) {
          if (dt === void 0) {
            dt = 0.1;
          }

          var before = this.phase;
          this.tickWaveTransitionUi(dt);

          if (this.phase !== 'battle') {
            return {
              advancedWave: false,
              changedPhase: false
            };
          }

          var killsByUnit = {};
          var healingByUnit = {};
          this.tickAllies(dt, killsByUnit, healingByUnit);
          this.enemyAiSystem.tick(this.enemies, this.allies, dt);
          this.collisionSystem.resolve(this.allies, this.enemies, 3);
          this.enemies = this.enemies.filter(function (enemy) {
            return enemy.alive;
          });

          for (var _i = 0, _Object$entries = Object.entries(killsByUnit); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = _Object$entries[_i],
                unitInstanceId = _Object$entries$_i[0],
                kills = _Object$entries$_i[1];
            this.divine.addMetric(unitInstanceId, 'kills', kills);
            var completed = this.divine.resolveCompleted(unitInstanceId);

            if (completed) {
              this.evolveUnitInstance(unitInstanceId, completed.targetUnitId);
            }
          }

          for (var _i2 = 0, _Object$entries2 = Object.entries(healingByUnit); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _Object$entries2[_i2],
                _unitInstanceId = _Object$entries2$_i[0],
                healing = _Object$entries2$_i[1];
            this.divine.addMetric(_unitInstanceId, 'healing', healing);

            var _completed = this.divine.resolveCompleted(_unitInstanceId);

            if (_completed) {
              this.evolveUnitInstance(_unitInstanceId, _completed.targetUnitId);
            }
          }

          if (this.allies.filter(function (ally) {
            return ally.alive;
          }).length === 0) {
            this.phase = 'defeat';
            return {
              advancedWave: false,
              changedPhase: before !== this.phase
            };
          }

          if (this.enemies.length === 0) {
            if (this.waveNumber >= this.waves.length) {
              var _this$onVictory;

              this.phase = 'victory';
              (_this$onVictory = this.onVictory) === null || _this$onVictory === void 0 ? void 0 : _this$onVictory.call(this);
              return {
                advancedWave: false,
                changedPhase: before !== this.phase
              };
            }

            this.waveNumber += 1;
            this.phase = 'prep';
            this.resetBattleStateForNextWave();
            this.shop.refresh();
            this.uiState = {
              prepPanel: 'rising',
              battlefieldLighting: 'dim',
              transitionProgress: 0,
              nextWaveReady: false
            };
            return {
              advancedWave: true,
              changedPhase: before !== this.phase
            };
          }

          return {
            advancedWave: false,
            changedPhase: before !== this.phase
          };
        };

        _proto.tickWaveTransitionUi = function tickWaveTransitionUi(dt) {
          if (this.uiState.transitionProgress >= 1) {
            if (this.pendingBattleStart && this.phase === 'prep') {
              this.beginBattleNow();
            }

            return;
          }

          this.uiState.transitionProgress = Math.min(1, this.uiState.transitionProgress + dt * 2.5);

          if (this.uiState.transitionProgress >= 1) {
            if (this.pendingBattleStart) {
              this.uiState.prepPanel = 'hidden';
              this.uiState.battlefieldLighting = 'bright';
              this.uiState.nextWaveReady = true;

              if (this.phase === 'prep') {
                this.beginBattleNow();
              }
            } else {
              this.uiState.prepPanel = 'visible';
              this.uiState.battlefieldLighting = 'dim';
              this.uiState.nextWaveReady = true;
            }
          }
        };

        _proto.beginBattleNow = function beginBattleNow() {
          this.assignDivineTasksAtRoundStart();
          this.phase = 'battle';
          this.pendingBattleStart = false;
          this.allies = this.buildBattleAlliesFromDeployedRoster();
          this.spawnWave(this.waveNumber);
        };

        _proto.selectUnit = function selectUnit(unitInstanceId) {
          return this.commandSystem.selectUnit(unitInstanceId, this.allies);
        };

        _proto.commandMoveToGround = function commandMoveToGround(position) {
          return this.commandSystem.issueMoveToGround(position, this.allies);
        };

        _proto.commandFocusEnemy = function commandFocusEnemy(enemyInstanceId) {
          return this.commandSystem.issueFocusEnemy(enemyInstanceId, this.allies);
        };

        _proto.commandPriestHeal = function commandPriestHeal(allyInstanceId) {
          return this.commandSystem.issueChannelHealAlly(allyInstanceId, this.allies);
        };

        _proto.sellUnit = function sellUnit(instanceId) {
          if (this.phase !== 'prep') return false;
          var snap = this.getSnapshot();
          var target = [].concat(snap.bench, snap.deployed).find(function (u) {
            return u.instanceId === instanceId;
          });
          if (!target) return false;
          if (!this.roster.removeUnit(instanceId)) return false;
          var sellPrice = Math.max(1, Math.floor(UNIT_CONFIG[target.unitId].cost * target.star / 2));
          this.economy.earn(sellPrice);
          return true;
        };

        _proto.getSnapshot = function getSnapshot() {
          return {
            phase: this.phase,
            waveNumber: this.waveNumber,
            totalWaves: this.waves.length,
            currentWave: this.waveNumber,
            gold: this.economy.getGold(),
            shop: this.shop.getEntries(),
            bench: this.roster.getBench(),
            deployed: this.roster.getDeployed(),
            divineTasks: this.divine.getAllProgress().map(function (p) {
              return {
                unitInstanceId: p.unitInstanceId,
                divineTaskId: p.taskId,
                divineProgress: p.progress
              };
            }),
            slotConfig: {
              deployed: SQUAD_DEPLOY_SLOTS,
              bench: SQUAD_BENCH_SLOTS,
              shop: SQUAD_SHOP_SLOTS
            },
            uiState: _extends({}, this.uiState),
            selectedUnitId: this.commandSystem.getSelectedUnitId(),
            allies: this.allies.map(function (u) {
              return _extends({}, u, {
                position: _extends({}, u.position),
                velocity: _extends({}, u.velocity),
                command: _extends({}, u.command)
              });
            }),
            enemies: this.enemies.map(function (e) {
              return _extends({}, e, {
                position: _extends({}, e.position),
                velocity: _extends({}, e.velocity)
              });
            })
          };
        };

        _proto.exportSaveData = function exportSaveData() {
          return {
            difficulty: this.difficulty,
            phase: this.phase,
            waveNumber: this.waveNumber,
            gold: this.economy.getGold(),
            shop: this.shop.getEntries(),
            bench: this.roster.getBench(),
            deployed: this.roster.getDeployed(),
            divineTasks: this.divine.getAllProgress().map(function (progress) {
              return _extends({}, progress);
            }),
            selectedStarterUnitId: this.selectedStarterUnitId,
            pendingBattleStart: this.pendingBattleStart,
            uiState: _extends({}, this.uiState),
            allies: this.allies.map(function (u) {
              return _extends({}, u, {
                position: _extends({}, u.position),
                velocity: _extends({}, u.velocity),
                command: _extends({}, u.command)
              });
            }),
            enemies: this.enemies.map(function (e) {
              return _extends({}, e, {
                position: _extends({}, e.position),
                velocity: _extends({}, e.velocity)
              });
            })
          };
        };

        _proto.loadFromSaveData = function loadFromSaveData(data) {
          if (!data) return false;
          this.phase = data.phase;
          this.difficulty = data.difficulty;
          this.selectedStarterUnitId = data.selectedStarterUnitId;
          this.waveNumber = data.waveNumber;
          this.pendingBattleStart = data.pendingBattleStart;
          this.uiState = _extends({}, data.uiState);
          this.economy.setGold(data.gold);
          this.shop.setEntries(data.shop);
          this.roster.setState(data.bench, data.deployed);
          this.divine = new DivineTaskSystem();
          this.divine.setAllProgress(data.divineTasks.map(function (progress) {
            return _extends({}, progress);
          }));
          this.allies = data.allies.map(function (u) {
            return _extends({}, u, {
              position: _extends({}, u.position),
              velocity: _extends({}, u.velocity),
              command: _extends({}, u.command)
            });
          });
          this.enemies = data.enemies.map(function (e) {
            return _extends({}, e, {
              position: _extends({}, e.position),
              velocity: _extends({}, e.velocity)
            });
          });
          this.commandSystem.clearSelection();
          syncIdSeedFromIds([].concat(data.bench.map(function (u) {
            return u.instanceId;
          }), data.deployed.map(function (u) {
            return u.instanceId;
          }), data.allies.map(function (u) {
            return u.instanceId;
          }), data.enemies.map(function (u) {
            return u.instanceId;
          })));
          return true;
        };

        _proto.tickAllies = function tickAllies(dt, killsByUnit, healingByUnit) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.allies), _step; !(_step = _iterator()).done;) {
            var ally = _step.value;
            if (!ally.alive) continue;
            ally.attackCooldownLeft = Math.max(0, ally.attackCooldownLeft - dt);
            var cfg = this.getScaledStats(ally.unitId, ally.star);

            if (ally.role === 'priest') {
              var healing = this.tickPriest(ally, dt);

              if (healing > 0) {
                var _healingByUnit$ally$i;

                healingByUnit[ally.instanceId] = ((_healingByUnit$ally$i = healingByUnit[ally.instanceId]) !== null && _healingByUnit$ally$i !== void 0 ? _healingByUnit$ally$i : 0) + healing;
              }

              continue;
            }

            if (ally.command.type === 'move' && ally.command.position) {
              this.movementSystem.moveTowards(ally, ally.command.position, cfg.moveSpeed, dt);
              continue;
            }

            var commandTarget = ally.command.type === 'focus_enemy' && ally.command.targetEnemyId ? this.targetingSystem.findEnemyById(ally.command.targetEnemyId, this.enemies) : undefined;

            if (!commandTarget) {
              var searchRange = ally.role === 'melee' ? cfg.reactionRange : cfg.attackRange;
              commandTarget = this.targetingSystem.findNearestEnemyInRange(ally, this.enemies, searchRange);
            }

            if (!commandTarget) {
              this.movementSystem.stop(ally);
              continue;
            }

            var dist = Math.hypot(commandTarget.position.x - ally.position.x, commandTarget.position.y - ally.position.y);

            if (dist > cfg.attackRange) {
              if (ally.command.type === 'focus_enemy' || ally.role === 'melee') {
                this.movementSystem.moveTowards(ally, commandTarget.position, cfg.moveSpeed, dt, cfg.attackRange * 0.9);
              } else {
                this.movementSystem.stop(ally);
              }
            } else {
              this.movementSystem.stop(ally);
              var attackResult = this.attackSystem.attackIfPossible(ally, commandTarget);

              if (attackResult.killed) {
                var _killsByUnit$ally$ins;

                killsByUnit[ally.instanceId] = ((_killsByUnit$ally$ins = killsByUnit[ally.instanceId]) !== null && _killsByUnit$ally$ins !== void 0 ? _killsByUnit$ally$ins : 0) + 1;
              }
            }
          }
        };

        _proto.tickPriest = function tickPriest(priest, dt) {
          var cfg = this.getScaledStats(priest.unitId, priest.star);
          var target = priest.command.type === 'channel_heal' && priest.command.targetAllyId ? this.targetingSystem.findAllyById(priest.command.targetAllyId, this.allies) : undefined;

          if (!target) {
            this.movementSystem.stop(priest);
            return 0;
          }

          var dist = Math.hypot(priest.position.x - target.position.x, priest.position.y - target.position.y);

          if (dist > cfg.attackRange) {
            this.movementSystem.moveTowards(priest, target.position, cfg.moveSpeed, dt, cfg.attackRange * 0.85);
            return 0;
          }

          this.movementSystem.stop(priest);
          var healResult = this.healingSystem.healIfPossible(priest, target);
          return healResult.actualHeal;
        };

        _proto.resetBattleStateForNextWave = function resetBattleStateForNextWave() {
          this.enemies = [];
          this.allies = [];
          this.commandSystem.clearSelection();
        };

        _proto.assignDivineTasksAtRoundStart = function assignDivineTasksAtRoundStart() {
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.roster.getAllUnits()), _step2; !(_step2 = _iterator2()).done;) {
            var unit = _step2.value;
            var progress = this.divine.tryAssignTask({
              instanceId: unit.instanceId,
              unitId: unit.unitId,
              star: unit.star,
              assignedTaskId: unit.assignedTaskId
            });

            if (progress) {
              this.roster.assignTask(unit.instanceId, progress.taskId);
            }
          }
        };

        _proto.evolveUnitInstance = function evolveUnitInstance(instanceId, targetUnitId) {
          this.roster.evolveUnit(instanceId, targetUnitId);
          var ally = this.allies.find(function (u) {
            return u.instanceId === instanceId;
          });
          if (!ally) return;
          ally.unitId = targetUnitId;
          ally.star = 3;
          ally.assignedTaskId = undefined;
          ally.role = SQUAD_ROLE_MAP[targetUnitId];
          ally.currentHp = Math.min(ally.currentHp, this.getScaledStats(targetUnitId, 3).maxHp);
        };

        _proto.buildBattleAlliesFromDeployedRoster = function buildBattleAlliesFromDeployedRoster() {
          var _this = this;

          var deploy = this.roster.getDeployUnitsForBattle().slice(0, 5);
          return deploy.map(function (unit, idx) {
            return {
              instanceId: unit.instanceId,
              unitId: unit.unitId,
              star: unit.star,
              isCaptain: unit.isCaptain,
              role: SQUAD_ROLE_MAP[unit.unitId],
              position: {
                x: SQUAD_BATTLEFIELD.centerLineX,
                y: SQUAD_BATTLEFIELD.centerLineY + (idx - Math.floor(deploy.length / 2)) * SQUAD_BATTLEFIELD.allySpawnGapY
              },
              velocity: {
                x: 0,
                y: 0
              },
              currentHp: _this.getScaledStats(unit.unitId, unit.star).maxHp,
              attackCooldownLeft: 0,
              alive: true,
              assignedTaskId: unit.assignedTaskId,
              command: {
                type: 'idle'
              }
            };
          });
        };

        _proto.getScaledStats = function getScaledStats(unitId, star) {
          var base = SQUAD_UNIT_STATS[unitId];
          var hpMultiplier = 1 + (star - 1) * 0.7;
          return _extends({}, base, {
            maxHp: Math.round(base.maxHp * hpMultiplier)
          });
        };

        _proto.spawnWave = function spawnWave(waveNumber) {
          var wave = this.waves[waveNumber - 1];

          if (!wave) {
            this.enemies = [];
            return;
          }

          var leftBias = this.isAlliesCampingLeft();
          var spawned = [];

          for (var _iterator3 = _createForOfIteratorHelperLoose(wave.enemies), _step3; !(_step3 = _iterator3()).done;) {
            var entry = _step3.value;

            for (var i = 0; i < entry.count; i += 1) {
              var spawnFromLeft = leftBias && i % 4 === 0;
              var yRange = SQUAD_BATTLEFIELD.spawnYMax - SQUAD_BATTLEFIELD.spawnYMin;
              var y = SQUAD_BATTLEFIELD.spawnYMin + (i * 71 + waveNumber * 37) % Math.max(1, yRange);
              var x = spawnFromLeft ? SQUAD_BATTLEFIELD.leftSpawnX : SQUAD_BATTLEFIELD.rightSpawnX;
              var cfg = ENEMY_STATS[entry.enemyType];
              spawned.push({
                instanceId: nextId('enemy_squad'),
                enemyType: entry.enemyType,
                position: {
                  x: x,
                  y: y
                },
                velocity: {
                  x: 0,
                  y: 0
                },
                currentHp: cfg.maxHp,
                attackCooldownLeft: 0,
                alive: true
              });
            }
          }

          this.enemies = spawned;
        };

        _proto.isAlliesCampingLeft = function isAlliesCampingLeft() {
          if (this.allies.length === 0) return false;
          var leftCount = this.allies.filter(function (ally) {
            return ally.position.x < SQUAD_BATTLEFIELD.centerLineX - 120;
          }).length;
          return leftCount >= Math.ceil(this.allies.length * 0.7);
        };

        return SquadBattleSession;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/unit-view.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Node, Sprite, Color, Vec3, Label, ProgressBar, Graphics, Button, Component, _inheritsLoose, _defineProperty, _assertThisInitialized;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Node = module.Node;
      Sprite = module.Sprite;
      Color = module.Color;
      Vec3 = module.Vec3;
      Label = module.Label;
      ProgressBar = module.ProgressBar;
      Graphics = module.Graphics;
      Button = module.Button;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "3396fuSmt9OqZ1xZStFxYY3", "unit-view", undefined);

      var ccclass = _decorator.ccclass;
      var UNIT_SIZE = 96;
      var UNIT_HP_WIDTH = 82;
      var UNIT_FRAME_MS = 170;
      var UnitView = exports('UnitView', (_dec = ccclass('UnitView'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(UnitView, _Component);

        function UnitView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "spriteNode", null);

          _defineProperty(_assertThisInitialized(_this), "sprite", null);

          _defineProperty(_assertThisInitialized(_this), "label", null);

          _defineProperty(_assertThisInitialized(_this), "commandLabel", null);

          _defineProperty(_assertThisInitialized(_this), "hpBar", null);

          _defineProperty(_assertThisInitialized(_this), "hpFill", null);

          _defineProperty(_assertThisInitialized(_this), "selectedRing", null);

          _defineProperty(_assertThisInitialized(_this), "onClick", void 0);

          return _this;
        }

        var _proto = UnitView.prototype;

        _proto.setup = function setup() {
          var _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          this.node.addComponent(UITransform).setContentSize(UNIT_SIZE, UNIT_SIZE);
          this.spriteNode = new Node('Sprite');
          this.spriteNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.spriteNode);
          this.spriteNode.addComponent(UITransform).setContentSize(UNIT_SIZE, UNIT_SIZE);
          this.sprite = this.spriteNode.addComponent(Sprite);
          this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          this.sprite.color = new Color(52, 211, 153, 255);
          var labelNode = new Node('Label');
          labelNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(labelNode);
          labelNode.setPosition(new Vec3(0, 56, 0));
          labelNode.addComponent(UITransform).setContentSize(140, 22);
          this.label = labelNode.addComponent(Label);
          this.label.fontSize = 12;
          this.label.lineHeight = 16;
          this.label.color = new Color(241, 245, 249, 255);
          var commandNode = new Node('Command');
          commandNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(commandNode);
          commandNode.setPosition(new Vec3(0, 42, 0));
          commandNode.addComponent(UITransform).setContentSize(120, 18);
          this.commandLabel = commandNode.addComponent(Label);
          this.commandLabel.fontSize = 10;
          this.commandLabel.lineHeight = 12;
          this.commandLabel.color = new Color(253, 224, 71, 255);
          var hpNode = new Node('Hp');
          hpNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(hpNode);
          hpNode.setPosition(new Vec3(0, -56, 0));
          hpNode.addComponent(UITransform).setContentSize(UNIT_HP_WIDTH, 8);
          var hpBg = hpNode.addComponent(Sprite);
          hpBg.color = new Color(30, 41, 59, 255);
          this.hpBar = hpNode.addComponent(ProgressBar);
          var hpFillNode = new Node('Fill');
          hpFillNode.layer = Layers.Enum.UI_2D;
          hpNode.addChild(hpFillNode);
          hpFillNode.setPosition(new Vec3(-UNIT_HP_WIDTH / 2, 0, 0));
          hpFillNode.addComponent(UITransform).setContentSize(UNIT_HP_WIDTH, 8);
          this.hpFill = hpFillNode.addComponent(Sprite);
          this.hpFill.color = new Color(74, 222, 128, 255);
          this.hpBar.barSprite = this.hpFill;
          this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
          this.hpBar.totalLength = UNIT_HP_WIDTH;
          this.selectedRing = new Node('Selected');
          this.selectedRing.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.selectedRing);
          this.selectedRing.setPosition(new Vec3(0, -34, 0));
          this.selectedRing.addComponent(UITransform).setContentSize(UNIT_SIZE + 12, UNIT_SIZE + 12);
          var ring = this.selectedRing.addComponent(Graphics);
          ring.fillColor = new Color(251, 191, 36, 110);
          ring.strokeColor = new Color(254, 240, 138, 235);
          ring.lineWidth = 4;
          ring.circle(0, 0, 34);
          ring.fill();
          ring.stroke();
          this.selectedRing.active = false;
          this.node.addComponent(Button);
          this.node.on(Button.EventType.CLICK, function () {
            var _this2$onClick;

            return (_this2$onClick = _this2.onClick) === null || _this2$onClick === void 0 ? void 0 : _this2$onClick.call(_this2);
          }, this);
        };

        _proto.render = function render(state, maxHp, selected, spriteFrame, animationFrames) {
          if (animationFrames === void 0) {
            animationFrames = [];
          }

          if (!this.sprite || !this.label || !this.hpBar || !this.commandLabel) return;
          var moving = state.alive && (Math.hypot(state.velocity.x, state.velocity.y) > 1 || state.command.type === 'move');
          this.sprite.spriteFrame = moving ? spriteFrame : this.pickFrame(spriteFrame, animationFrames);
          this.applyPose(state, moving);
          this.sprite.color = spriteFrame ? new Color(255, 255, 255, 255) : selected ? new Color(249, 115, 22, 255) : state.role === 'priest' ? new Color(96, 165, 250, 255) : new Color(52, 211, 153, 255);
          this.label.string = "" + (state.isCaptain ? '♛ ' : '') + state.unitId + "\u2605" + state.star + (state.assignedTaskId ? ' ✦' : '');
          this.commandLabel.string = this.getCommandText(state);
          this.hpBar.progress = Math.max(0, Math.min(1, state.currentHp / Math.max(1, maxHp)));
          if (this.selectedRing) this.selectedRing.active = selected;
        };

        _proto.getCommandText = function getCommandText(state) {
          if (state.command.type === 'move') return '移动';
          if (state.command.type === 'focus_enemy') return '集火';
          if (state.command.type === 'channel_heal') return '治疗';
          if (state.isCaptain) return '队长';
          return state.assignedTaskId ? '神品' : '';
        };

        _proto.pickFrame = function pickFrame(spriteFrame, animationFrames) {
          var _animationFrames$inde;

          if (animationFrames.length === 0) return spriteFrame;
          var index = Math.floor(Date.now() / UNIT_FRAME_MS) % animationFrames.length;
          return (_animationFrames$inde = animationFrames[index]) !== null && _animationFrames$inde !== void 0 ? _animationFrames$inde : spriteFrame;
        };

        _proto.applyPose = function applyPose(state, moving) {
          if (!this.spriteNode) return;
          this.spriteNode.setPosition(new Vec3(0, 0, 0));
          this.spriteNode.setScale(new Vec3(1, 1, 1));
          this.spriteNode.angle = 0;

          if (!state.alive) {
            this.spriteNode.setPosition(new Vec3(6, -12, 0));
            this.spriteNode.setScale(new Vec3(0.95, 0.95, 1));
            this.spriteNode.angle = 72;
            return;
          }

          if (moving) {
            var cycle = Date.now() % 720 / 720;
            var step = Math.sin(cycle * Math.PI * 2);
            var stride = Math.sin(cycle * Math.PI * 4);
            var lift = Math.abs(stride);
            this.spriteNode.setPosition(new Vec3(step * 2.2, lift * 4, 0));
            this.spriteNode.setScale(new Vec3(1 + lift * 0.025, 1 - lift * 0.018, 1));
            this.spriteNode.angle = step * 3.2;
            return;
          }

          if (state.attackCooldownLeft > 0 || state.command.type === 'focus_enemy' || state.command.type === 'channel_heal') {
            var pulse = Math.sin(Date.now() % 360 / 360 * Math.PI);
            this.spriteNode.setPosition(new Vec3(pulse * 3, 0, 0));
            this.spriteNode.setScale(new Vec3(1 + pulse * 0.025, 1 + pulse * 0.015, 1));
            this.spriteNode.angle = -pulse * 2;
          }
        };

        return UnitView;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/enemy-view.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Node, Sprite, Color, Vec3, Label, ProgressBar, Button, Component, _inheritsLoose, _defineProperty, _assertThisInitialized;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Node = module.Node;
      Sprite = module.Sprite;
      Color = module.Color;
      Vec3 = module.Vec3;
      Label = module.Label;
      ProgressBar = module.ProgressBar;
      Button = module.Button;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "34207wp5mJFo572Vny6hwRJ", "enemy-view", undefined);

      var ccclass = _decorator.ccclass;
      var ENEMY_NAMES = {
        grunt: '小兵',
        brute: '蛮兵',
        boss: '首领'
      };
      var ENEMY_FRAME_MS = 170;
      var ENEMY_SIZE = {
        grunt: 88,
        brute: 100,
        boss: 128
      };
      var EnemyView = exports('EnemyView', (_dec = ccclass('EnemyView'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(EnemyView, _Component);

        function EnemyView() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "spriteNode", null);

          _defineProperty(_assertThisInitialized(_this), "sprite", null);

          _defineProperty(_assertThisInitialized(_this), "label", null);

          _defineProperty(_assertThisInitialized(_this), "hpBar", null);

          _defineProperty(_assertThisInitialized(_this), "hpFill", null);

          _defineProperty(_assertThisInitialized(_this), "onClick", void 0);

          return _this;
        }

        var _proto = EnemyView.prototype;

        _proto.setup = function setup() {
          var _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          this.node.addComponent(UITransform).setContentSize(88, 88);
          this.spriteNode = new Node('Sprite');
          this.spriteNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.spriteNode);
          this.spriteNode.addComponent(UITransform).setContentSize(88, 88);
          this.sprite = this.spriteNode.addComponent(Sprite);
          this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          this.sprite.color = new Color(248, 113, 113, 255);
          var labelNode = new Node('Label');
          labelNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(labelNode);
          labelNode.setPosition(new Vec3(0, 54, 0));
          labelNode.addComponent(UITransform).setContentSize(100, 20);
          this.label = labelNode.addComponent(Label);
          this.label.fontSize = 11;
          this.label.color = new Color(254, 226, 226, 255);
          var hpNode = new Node('Hp');
          hpNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(hpNode);
          hpNode.setPosition(new Vec3(0, -54, 0));
          hpNode.addComponent(UITransform).setContentSize(76, 7);
          var hpBg = hpNode.addComponent(Sprite);
          hpBg.color = new Color(69, 10, 10, 255);
          this.hpBar = hpNode.addComponent(ProgressBar);
          var hpFillNode = new Node('Fill');
          hpFillNode.layer = Layers.Enum.UI_2D;
          hpNode.addChild(hpFillNode);
          hpFillNode.setPosition(new Vec3(-38, 0, 0));
          hpFillNode.addComponent(UITransform).setContentSize(76, 7);
          this.hpFill = hpFillNode.addComponent(Sprite);
          this.hpFill.color = new Color(239, 68, 68, 255);
          this.hpBar.barSprite = this.hpFill;
          this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
          this.hpBar.totalLength = 76;
          this.node.addComponent(Button);
          this.node.on(Button.EventType.CLICK, function () {
            var _this2$onClick;

            return (_this2$onClick = _this2.onClick) === null || _this2$onClick === void 0 ? void 0 : _this2$onClick.call(_this2);
          }, this);
        };

        _proto.render = function render(state, maxHp, spriteFrame, animationFrames) {
          var _ENEMY_NAMES$state$en;

          if (animationFrames === void 0) {
            animationFrames = [];
          }

          if (!this.sprite || !this.label || !this.hpBar) return;
          var moving = state.alive && Math.hypot(state.velocity.x, state.velocity.y) > 1;
          this.resizeForEnemy(state.enemyType);
          this.sprite.spriteFrame = moving ? spriteFrame : this.pickFrame(spriteFrame, animationFrames);
          this.applyPose(state, moving);
          this.sprite.color = spriteFrame ? new Color(255, 255, 255, 255) : new Color(248, 113, 113, 255);
          this.label.string = ((_ENEMY_NAMES$state$en = ENEMY_NAMES[state.enemyType]) !== null && _ENEMY_NAMES$state$en !== void 0 ? _ENEMY_NAMES$state$en : state.enemyType) + " " + Math.floor(state.currentHp);
          this.hpBar.progress = Math.max(0, Math.min(1, state.currentHp / Math.max(1, maxHp)));
        };

        _proto.pickFrame = function pickFrame(spriteFrame, animationFrames) {
          var _animationFrames$inde;

          if (animationFrames.length === 0) return spriteFrame;
          var index = Math.floor(Date.now() / ENEMY_FRAME_MS) % animationFrames.length;
          return (_animationFrames$inde = animationFrames[index]) !== null && _animationFrames$inde !== void 0 ? _animationFrames$inde : spriteFrame;
        };

        _proto.resizeForEnemy = function resizeForEnemy(enemyType) {
          var _this$node$getCompone, _this$spriteNode, _this$spriteNode$getC;

          var size = ENEMY_SIZE[enemyType];
          (_this$node$getCompone = this.node.getComponent(UITransform)) === null || _this$node$getCompone === void 0 ? void 0 : _this$node$getCompone.setContentSize(size, size);
          (_this$spriteNode = this.spriteNode) === null || _this$spriteNode === void 0 ? void 0 : (_this$spriteNode$getC = _this$spriteNode.getComponent(UITransform)) === null || _this$spriteNode$getC === void 0 ? void 0 : _this$spriteNode$getC.setContentSize(size, size);
        };

        _proto.applyPose = function applyPose(state, moving) {
          if (!this.spriteNode) return;
          this.spriteNode.setPosition(new Vec3(0, 0, 0));
          this.spriteNode.setScale(new Vec3(1, 1, 1));
          this.spriteNode.angle = 0;

          if (!state.alive) {
            this.spriteNode.setPosition(new Vec3(6, -12, 0));
            this.spriteNode.setScale(new Vec3(0.95, 0.95, 1));
            this.spriteNode.angle = 72;
            return;
          }

          if (moving) {
            var cycle = Date.now() % 760 / 760;
            var step = Math.sin(cycle * Math.PI * 2);
            var stride = Math.sin(cycle * Math.PI * 4);
            var lift = Math.abs(stride);
            this.spriteNode.setPosition(new Vec3(step * 2, lift * 3.5, 0));
            this.spriteNode.setScale(new Vec3(1 + lift * 0.02, 1 - lift * 0.016, 1));
            this.spriteNode.angle = step * 3;
            return;
          }

          if (state.attackCooldownLeft > 0) {
            var pulse = Math.sin(Date.now() % 360 / 360 * Math.PI);
            this.spriteNode.setPosition(new Vec3(-pulse * 3, 0, 0));
            this.spriteNode.setScale(new Vec3(1 + pulse * 0.025, 1 + pulse * 0.015, 1));
            this.spriteNode.angle = pulse * 2;
          }
        };

        return EnemyView;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/economy-system.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _defineProperty;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _defineProperty = module.defineProperty;
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

        _proto.setGold = function setGold(value) {
          this.gold = Math.max(0, Math.floor(value));
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

System.register("chunks:///_virtual/movement-system.ts", ['cc', './math.ts', './squad-battle-config.ts'], function (exports) {
  'use strict';

  var cclegacy, distance, normalize, clamp, SQUAD_BATTLEFIELD;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
      normalize = module.normalize;
      clamp = module.clamp;
    }, function (module) {
      SQUAD_BATTLEFIELD = module.SQUAD_BATTLEFIELD;
    }],
    execute: function () {
      cclegacy._RF.push({}, "425deeSCSJM65zxJ9IptJV7", "movement-system", undefined);

      var MovementSystem = exports('MovementSystem', /*#__PURE__*/function () {
        function MovementSystem() {}

        var _proto = MovementSystem.prototype;

        _proto.moveTowards = function moveTowards(unit, target, speed, dt, stopDistance) {
          if (stopDistance === void 0) {
            stopDistance = 4;
          }

          var dist = distance(unit.position, target);

          if (dist <= stopDistance) {
            unit.velocity.x = 0;
            unit.velocity.y = 0;
            return;
          }

          var dir = normalize(unit.position, target);
          unit.velocity.x = dir.x * speed;
          unit.velocity.y = dir.y * speed;
          unit.position.x = clamp(unit.position.x + unit.velocity.x * dt, 0, SQUAD_BATTLEFIELD.width);
          unit.position.y = clamp(unit.position.y + unit.velocity.y * dt, 0, SQUAD_BATTLEFIELD.height);
        };

        _proto.stop = function stop(unit) {
          unit.velocity.x = 0;
          unit.velocity.y = 0;
        };

        return MovementSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/local-profile-storage.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, sys, _extends;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      sys = module.sys;
    }, function (module) {
      _extends = module.extends;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4a406rRNdBF56f45kaE8XoC", "local-profile-storage", undefined);

      var RUN_SAVE_KEY = 'divine_tower_chess.run_save.v1';
      var SETTINGS_KEY = 'divine_tower_chess.settings.v1';
      var ACHIEVEMENTS_KEY = 'divine_tower_chess.achievements.v1';
      var DEFAULT_SETTINGS = {
        master: 80,
        music: 70,
        sfx: 80
      };
      var DEFAULT_ACHIEVEMENTS = {
        firstClear: false
      };

      function readJson(key, fallback) {
        try {
          var raw = sys.localStorage.getItem(key);
          if (!raw) return fallback;
          return _extends({}, fallback, JSON.parse(raw));
        } catch (_unused) {
          return fallback;
        }
      }

      var LocalProfileStorage = exports('LocalProfileStorage', /*#__PURE__*/function () {
        function LocalProfileStorage() {}

        var _proto = LocalProfileStorage.prototype;

        _proto.loadSettings = function loadSettings() {
          return readJson(SETTINGS_KEY, DEFAULT_SETTINGS);
        };

        _proto.saveSettings = function saveSettings(settings) {
          sys.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        };

        _proto.loadAchievements = function loadAchievements() {
          return readJson(ACHIEVEMENTS_KEY, DEFAULT_ACHIEVEMENTS);
        };

        _proto.saveAchievements = function saveAchievements(achievements) {
          sys.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        };

        _proto.loadRun = function loadRun() {
          try {
            var raw = sys.localStorage.getItem(RUN_SAVE_KEY);
            return raw ? JSON.parse(raw) : null;
          } catch (_unused2) {
            return null;
          }
        };

        _proto.saveRun = function saveRun(data) {
          sys.localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(data));
        };

        _proto.clearRun = function clearRun() {
          sys.localStorage.removeItem(RUN_SAVE_KEY);
        };

        _proto.hasRunSave = function hasRunSave() {
          return Boolean(this.loadRun());
        };

        return LocalProfileStorage;
      }());

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

System.register("chunks:///_virtual/prep-panel-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './unit-config.ts', './sprite-resolvers.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Color, Node, Vec3, Sprite, Label, Button, Graphics, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, SHOP_UNIT_POOL, UNIT_CONFIG, UnitSpriteResolver, UiIconResolver;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Color = module.Color;
      Node = module.Node;
      Vec3 = module.Vec3;
      Sprite = module.Sprite;
      Label = module.Label;
      Button = module.Button;
      Graphics = module.Graphics;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      SHOP_UNIT_POOL = module.SHOP_UNIT_POOL;
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      UnitSpriteResolver = module.UnitSpriteResolver;
      UiIconResolver = module.UiIconResolver;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "58095pyklxOy4f8v8ZmQ6vI", "prep-panel-controller", undefined);

      var ccclass = _decorator.ccclass;
      var SHOP_CARD_WIDTH = 132;
      var SHOP_CARD_HEIGHT = 76;
      var ROSTER_CARD_WIDTH = 92;
      var ROSTER_CARD_HEIGHT = 66;
      var PrepPanelController = exports('PrepPanelController', (_dec = ccclass('PrepPanelController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(PrepPanelController, _Component);

        function PrepPanelController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "unitResolver", new UnitSpriteResolver());

          _defineProperty(_assertThisInitialized(_this), "iconResolver", new UiIconResolver());

          _defineProperty(_assertThisInitialized(_this), "avatarFrames", new Map());

          _defineProperty(_assertThisInitialized(_this), "goldFrame", null);

          _defineProperty(_assertThisInitialized(_this), "onBuy", void 0);

          _defineProperty(_assertThisInitialized(_this), "onDeploy", void 0);

          _defineProperty(_assertThisInitialized(_this), "onRecall", void 0);

          _defineProperty(_assertThisInitialized(_this), "onSell", void 0);

          _defineProperty(_assertThisInitialized(_this), "onRefresh", void 0);

          _defineProperty(_assertThisInitialized(_this), "onStartWave", void 0);

          _defineProperty(_assertThisInitialized(_this), "infoLabel", null);

          return _this;
        }

        var _proto = PrepPanelController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone,
              _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(920, 240);
          this.paintRect(this.node, 920, 240, new Color(15, 23, 42, 235));
          this.infoLabel = this.makeLabel('Info', -430, 100, 840, 14, new Color(251, 191, 36, 255));

          var _loop = function _loop() {
            var unitId = _step.value;
            void _this2.unitResolver.resolveAvatar(unitId).then(function (frame) {
              if (frame) _this2.avatarFrames.set(unitId, frame);
            });
          };

          for (var _iterator = _createForOfIteratorHelperLoose(SHOP_UNIT_POOL), _step; !(_step = _iterator()).done;) {
            _loop();
          }

          void this.iconResolver.resolve('gold').then(function (frame) {
            _this2.goldFrame = frame;
          });
        };

        _proto.render = function render(snapshot, selectedLabel, selectedUnitId) {
          var _this3 = this;

          this.node.removeAllChildren();
          this.infoLabel = this.makeLabel('Info', -430, 100, 680, 14, new Color(251, 191, 36, 255));
          this.infoLabel.string = "\u51C6\u5907\u9636\u6BB5 \xB7 \u5F53\u524D\u9009\u62E9\uFF1A" + selectedLabel;
          this.makeGoldReadout(snapshot.gold);
          this.makeLabel('ShopTitle', -430, 72, 140, 13, new Color(226, 232, 240, 255)).string = '商店（3）';
          snapshot.shop.forEach(function (unitId, index) {
            _this3.makeUnitCard({
              name: "Buy-" + index,
              unitId: unitId,
              star: 1,
              text: _this3.getUnitName(unitId) + "\n\u8D2D\u4E70",
              x: -300 + index * 156,
              y: 42,
              width: SHOP_CARD_WIDTH,
              height: SHOP_CARD_HEIGHT,
              selected: false,
              color: new Color(30, 41, 59, 255),
              onClick: function onClick() {
                var _this3$onBuy;

                return (_this3$onBuy = _this3.onBuy) === null || _this3$onBuy === void 0 ? void 0 : _this3$onBuy.call(_this3, index);
              }
            });
          });
          this.makeLabel('DeployTitle', -430, 20, 140, 13, new Color(226, 232, 240, 255)).string = '上阵区（5）';

          var _loop2 = function _loop2(i) {
            var unit = snapshot.deployed[i];

            if (unit) {
              _this3.makeUnitCard({
                name: "Recall-" + unit.instanceId,
                unitId: unit.unitId,
                star: unit.star,
                text: "" + (unit.isCaptain ? '♛ ' : '') + _this3.getUnitName(unit.unitId) + "\u2605" + unit.star + (unit.assignedTaskId ? ' ✦' : '') + "\n\u64A4\u56DE",
                x: -320 + i * 130,
                y: -8,
                width: 122,
                height: 68,
                selected: unit.instanceId === selectedUnitId,
                color: new Color(30, 41, 59, 255),
                onClick: function onClick() {
                  var _this3$onRecall;

                  return (_this3$onRecall = _this3.onRecall) === null || _this3$onRecall === void 0 ? void 0 : _this3$onRecall.call(_this3, unit.instanceId);
                }
              });
            } else {
              _this3.makeButton("DeployEmpty-" + i, '空位', -320 + i * 130, -8, 122, 68, new Color(51, 65, 85, 160));
            }
          };

          for (var i = 0; i < snapshot.slotConfig.deployed; i += 1) {
            _loop2(i);
          }

          this.makeLabel('BenchTitle', -430, -52, 140, 13, new Color(226, 232, 240, 255)).string = '备战区（8）';

          var _loop3 = function _loop3(_i) {
            var unit = snapshot.bench[_i];
            var x = -382 + _i * 96;
            var y = -82;

            if (unit) {
              _this3.makeRosterCard(unit, x, y, unit.instanceId === selectedUnitId, function () {
                var _this3$onDeploy;

                return (_this3$onDeploy = _this3.onDeploy) === null || _this3$onDeploy === void 0 ? void 0 : _this3$onDeploy.call(_this3, unit.instanceId);
              });
            } else {
              _this3.makeButton("BenchEmpty-" + _i, '空位', x, y, ROSTER_CARD_WIDTH, ROSTER_CARD_HEIGHT, new Color(51, 65, 85, 160));
            }
          };

          for (var _i = 0; _i < snapshot.slotConfig.bench; _i += 1) {
            _loop3(_i);
          }

          this.makeButton('Sell', '卖出选中', 330, 52, 160, 34, new Color(127, 29, 29, 255), function () {
            var _this3$onSell;

            return (_this3$onSell = _this3.onSell) === null || _this3$onSell === void 0 ? void 0 : _this3$onSell.call(_this3);
          });
          this.makeButton('Refresh', '刷新商店', 330, 8, 160, 34, new Color(37, 99, 235, 255), function () {
            var _this3$onRefresh;

            return (_this3$onRefresh = _this3.onRefresh) === null || _this3$onRefresh === void 0 ? void 0 : _this3$onRefresh.call(_this3);
          });
          this.makeButton('Start', '开始下一波', 330, -36, 160, 34, new Color(21, 128, 61, 255), function () {
            var _this3$onStartWave;

            return (_this3$onStartWave = _this3.onStartWave) === null || _this3$onStartWave === void 0 ? void 0 : _this3$onStartWave.call(_this3);
          });
          this.makeLabel('Hint', -430, -116, 860, 12, new Color(191, 219, 254, 255)).string = this.buildHint(snapshot, selectedUnitId);
        };

        _proto.buildHint = function buildHint(snapshot, selectedUnitId) {
          if (!selectedUnitId) {
            return '提示：先购买或直接上阵起始队长。橙色高亮表示当前选中实例，带 ✦ 的单位持有神品任务。';
          }

          var rosterUnit = [].concat(snapshot.deployed, snapshot.bench).find(function (unit) {
            return unit.instanceId === selectedUnitId;
          });

          if (!rosterUnit) {
            return '提示：当前选中单位已离开备战链路。';
          }

          var inDeployed = snapshot.deployed.some(function (unit) {
            return unit.instanceId === selectedUnitId;
          });
          var task = snapshot.divineTasks.find(function (entry) {
            return entry.unitInstanceId === selectedUnitId;
          });

          if (task) {
            var _task$divineProgress;

            return "\u63D0\u793A\uFF1A" + this.getUnitName(rosterUnit.unitId) + "\u2605" + rosterUnit.star + " \u6301\u6709 " + task.divineTaskId + "\uFF0C\u5B9E\u4F8B\u8FDB\u5EA6 " + Math.floor((_task$divineProgress = task.divineProgress) !== null && _task$divineProgress !== void 0 ? _task$divineProgress : 0) + "\uFF0C\u666E\u901A\u5347\u661F\u4E0D\u4F1A\u6D88\u8017\u5B83\u3002";
          }

          if (rosterUnit.isCaptain) {
            return inDeployed ? "\u63D0\u793A\uFF1A" + this.getUnitName(rosterUnit.unitId) + "\u2605" + rosterUnit.star + " \u662F\u5F53\u524D\u961F\u957F\u5B9E\u4F8B\uFF0C\u5DF2\u5728\u4E0A\u9635\u533A\u3002" : "\u63D0\u793A\uFF1A" + this.getUnitName(rosterUnit.unitId) + "\u2605" + rosterUnit.star + " \u662F\u4F60\u9009\u62E9\u7684\u8D77\u59CB\u961F\u957F\u5B9E\u4F8B\uFF0C\u5F53\u524D\u4F4D\u4E8E\u5907\u6218\u533A\u3002";
          }

          return inDeployed ? "\u63D0\u793A\uFF1A" + this.getUnitName(rosterUnit.unitId) + "\u2605" + rosterUnit.star + " \u5F53\u524D\u5728\u4E0A\u9635\u533A\uFF0C\u53EF\u64A4\u56DE\u6216\u76F4\u63A5\u5F00\u6CE2\u3002" : "\u63D0\u793A\uFF1A" + this.getUnitName(rosterUnit.unitId) + "\u2605" + rosterUnit.star + " \u5F53\u524D\u5728\u5907\u6218\u533A\uFF0C\u53EF\u4E0A\u9635\uFF1B3 \u4E2A\u540C\u540D\u540C\u661F\u5B9E\u4F8B\u4F1A\u81EA\u52A8\u5408\u6210\u3002";
        };

        _proto.getUnitName = function getUnitName(unitId) {
          var _UNIT_CONFIG$unitId$n, _UNIT_CONFIG$unitId;

          return (_UNIT_CONFIG$unitId$n = (_UNIT_CONFIG$unitId = UNIT_CONFIG[unitId]) === null || _UNIT_CONFIG$unitId === void 0 ? void 0 : _UNIT_CONFIG$unitId.name) !== null && _UNIT_CONFIG$unitId$n !== void 0 ? _UNIT_CONFIG$unitId$n : unitId;
        };

        _proto.makeGoldReadout = function makeGoldReadout(gold) {
          var _this4 = this;

          var node = new Node('GoldReadout');
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(302, 100, 0));
          node.addComponent(UITransform).setContentSize(150, 28);
          var iconNode = new Node('GoldIcon');
          iconNode.layer = Layers.Enum.UI_2D;
          node.addChild(iconNode);
          iconNode.setPosition(new Vec3(-48, 0, 0));
          iconNode.addComponent(UITransform).setContentSize(24, 24);
          var icon = iconNode.addComponent(Sprite);
          icon.sizeMode = Sprite.SizeMode.CUSTOM;
          icon.color = new Color(245, 158, 11, 255);

          if (this.goldFrame) {
            icon.spriteFrame = this.goldFrame;
            icon.color = new Color(255, 255, 255, 255);
          } else {
            void this.iconResolver.resolve('gold').then(function (frame) {
              if (!frame || !icon.node.parent) return;
              _this4.goldFrame = frame;
              icon.spriteFrame = frame;
              icon.color = new Color(255, 255, 255, 255);
            });
          }

          var label = this.makeLabel('GoldValue', 18, 0, 90, 15, new Color(254, 240, 138, 255), node);
          label.string = "" + gold;
        };

        _proto.makeRosterCard = function makeRosterCard(unit, x, y, selected, onClick) {
          this.makeUnitCard({
            name: "Deploy-" + unit.instanceId,
            unitId: unit.unitId,
            star: unit.star,
            text: "" + (unit.isCaptain ? '♛ ' : '') + this.getUnitName(unit.unitId) + "\u2605" + unit.star + (unit.assignedTaskId ? ' ✦' : '') + "\n\u4E0A\u9635",
            x: x,
            y: y,
            width: ROSTER_CARD_WIDTH,
            height: ROSTER_CARD_HEIGHT,
            selected: selected,
            color: selected ? new Color(180, 83, 9, 255) : new Color(30, 41, 59, 255),
            onClick: onClick
          });
        };

        _proto.makeLabel = function makeLabel(name, x, y, width, fontSize, color, parent) {
          if (parent === void 0) {
            parent = this.node;
          }

          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          parent.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, 24);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 4;
          label.color = color;
          return label;
        };

        _proto.makeButton = function makeButton(name, text, x, y, width, height, color, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, height);
          this.paintRect(node, width, height, color, new Color(148, 163, 184, 70));
          var guardedClick = onClick ? this.makeGuardedClick(onClick) : undefined;

          if (guardedClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, guardedClick, this);
          }

          var labelNode = new Node(name + "-label");
          labelNode.layer = Layers.Enum.UI_2D;
          node.addChild(labelNode);
          labelNode.addComponent(UITransform).setContentSize(width - 8, height - 8);
          var label = labelNode.addComponent(Label);
          label.string = text;
          label.fontSize = 12;
          label.lineHeight = 14;
          label.color = new Color(248, 250, 252, 255);

          if (guardedClick) {
            labelNode.addComponent(Button);
            labelNode.on(Button.EventType.CLICK, guardedClick, this);
          }
        };

        _proto.makeUnitCard = function makeUnitCard(options) {
          var _this5 = this;

          var node = new Node(options.name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(options.x, options.y, 0));
          node.addComponent(UITransform).setContentSize(options.width, options.height);
          this.paintRect(node, options.width, options.height, options.selected ? new Color(180, 83, 9, 255) : options.color, options.selected ? new Color(254, 240, 138, 210) : new Color(148, 163, 184, 80));

          if (options.selected) {
            var glow = new Node(options.name + "-selected");
            glow.layer = Layers.Enum.UI_2D;
            node.addChild(glow);
            glow.setPosition(new Vec3(0, -6, 0));
            glow.addComponent(UITransform).setContentSize(options.width - 12, 12);
            this.paintRect(glow, options.width - 12, 12, new Color(254, 240, 138, 180));
          }

          var imageBack = new Node(options.name + "-image-back");
          imageBack.layer = Layers.Enum.UI_2D;
          node.addChild(imageBack);
          imageBack.setPosition(new Vec3(0, options.height * 0.13, 0));
          var imageBackWidth = Math.min(options.width - 18, options.height > 70 ? 74 : 58);
          var imageBackHeight = Math.min(options.height - 22, options.height > 70 ? 56 : 46);
          imageBack.addComponent(UITransform).setContentSize(imageBackWidth, imageBackHeight);
          var imageNode = new Node(options.name + "-image");
          imageNode.layer = Layers.Enum.UI_2D;
          imageBack.addChild(imageNode);
          imageNode.setPosition(new Vec3(0, 0, 0));
          imageNode.addComponent(UITransform).setContentSize(Math.min(72, options.width - 18), Math.min(58, options.height - 18));
          var unitSprite = imageNode.addComponent(Sprite);
          unitSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          unitSprite.color = new Color(148, 163, 184, 255);
          var cachedFrame = this.avatarFrames.get(options.unitId);

          if (cachedFrame) {
            unitSprite.spriteFrame = cachedFrame;
            unitSprite.color = new Color(255, 255, 255, 255);
          } else {
            void this.unitResolver.resolveAvatar(options.unitId).then(function (frame) {
              if (!frame || !unitSprite.node.parent) return;

              _this5.avatarFrames.set(options.unitId, frame);

              unitSprite.spriteFrame = frame;
              unitSprite.color = new Color(255, 255, 255, 255);
            });
          }

          var labelNode = new Node(options.name + "-label");
          labelNode.layer = Layers.Enum.UI_2D;
          node.addChild(labelNode);
          labelNode.setPosition(new Vec3(0, -options.height * 0.32, 0));
          labelNode.addComponent(UITransform).setContentSize(options.width - 8, 26);
          var label = labelNode.addComponent(Label);
          label.string = options.text;
          label.fontSize = 11;
          label.lineHeight = 13;
          label.color = new Color(248, 250, 252, 255);
          var guardedClick = options.onClick ? this.makeGuardedClick(options.onClick) : undefined;

          if (guardedClick) {
            node.addComponent(Button);
            node.on(Button.EventType.CLICK, guardedClick, this);
            labelNode.addComponent(Button);
            labelNode.on(Button.EventType.CLICK, guardedClick, this);
            imageNode.addComponent(Button);
            imageNode.on(Button.EventType.CLICK, guardedClick, this);
          }
        };

        _proto.paintRect = function paintRect(node, width, height, fill, stroke) {
          var graphics = node.addComponent(Graphics);
          graphics.fillColor = fill;
          graphics.rect(-width / 2, -height / 2, width, height);
          graphics.fill();

          if (stroke) {
            graphics.strokeColor = stroke;
            graphics.lineWidth = 2;
            graphics.rect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2);
            graphics.stroke();
          }
        };

        _proto.makeGuardedClick = function makeGuardedClick(onClick) {
          var lastClickAt = 0;
          return function () {
            var now = Date.now();
            if (now - lastClickAt < 80) return;
            lastClickAt = now;
            onClick();
          };
        };

        return PrepPanelController;
      }(Component), _temp)) || _class));

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
          maxHp: 140,
          detectionRange: 340,
          attackRange: 250,
          moveSpeed: 120,
          projectileSpeed: 560,
          skillType: 'single',
          behaviorRole: 'ranged'
        },
        shield_guard: {
          id: 'shield_guard',
          name: '盾卫',
          cost: 3,
          baseDamage: 12,
          attackInterval: 1.1,
          maxHp: 300,
          detectionRange: 240,
          attackRange: 68,
          moveSpeed: 90,
          skillType: 'none',
          behaviorRole: 'melee'
        },
        warrior: {
          id: 'warrior',
          name: '战士',
          cost: 3,
          baseDamage: 22,
          attackInterval: 1,
          maxHp: 220,
          detectionRange: 260,
          attackRange: 72,
          moveSpeed: 130,
          skillType: 'single',
          behaviorRole: 'melee'
        },
        mage: {
          id: 'mage',
          name: '法师',
          cost: 4,
          baseDamage: 14,
          attackInterval: 1.4,
          maxHp: 130,
          detectionRange: 360,
          attackRange: 230,
          moveSpeed: 105,
          projectileSpeed: 500,
          skillRadius: 100,
          skillType: 'aoe',
          behaviorRole: 'mage'
        },
        priest: {
          id: 'priest',
          name: '牧师',
          cost: 4,
          baseDamage: 6,
          attackInterval: 1.5,
          maxHp: 160,
          detectionRange: 360,
          attackRange: 210,
          moveSpeed: 110,
          healPower: 20,
          skillType: 'heal',
          behaviorRole: 'healer'
        },
        cavalry: {
          id: 'cavalry',
          name: '骑兵',
          cost: 4,
          baseDamage: 24,
          attackInterval: 0.95,
          maxHp: 200,
          detectionRange: 280,
          attackRange: 78,
          moveSpeed: 170,
          skillType: 'single',
          behaviorRole: 'melee'
        },
        spearman: {
          id: 'spearman',
          name: '枪兵',
          cost: 3,
          baseDamage: 19,
          attackInterval: 1,
          maxHp: 170,
          detectionRange: 270,
          attackRange: 90,
          moveSpeed: 125,
          skillType: 'single',
          behaviorRole: 'melee'
        },
        berserker: {
          id: 'berserker',
          name: '狂战士',
          isDivine: true,
          cost: 0,
          baseDamage: 50,
          attackInterval: 0.7,
          maxHp: 360,
          detectionRange: 300,
          attackRange: 80,
          moveSpeed: 160,
          skillType: 'single',
          behaviorRole: 'melee'
        },
        light_mage: {
          id: 'light_mage',
          name: '光法师',
          isDivine: true,
          cost: 0,
          baseDamage: 28,
          attackInterval: 1.1,
          maxHp: 240,
          detectionRange: 400,
          attackRange: 260,
          moveSpeed: 120,
          projectileSpeed: 620,
          healPower: 40,
          skillType: 'heal',
          behaviorRole: 'healer'
        }
      });
      var SHOP_UNIT_POOL = exports('SHOP_UNIT_POOL', ['archer', 'shield_guard', 'warrior', 'mage', 'priest', 'cavalry', 'spearman']);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/squad-ui-layout-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "85f58kW/BBN64wdtg8algHP", "squad-ui-layout-config", undefined);

      var SQUAD_DEPLOY_SLOTS = exports('SQUAD_DEPLOY_SLOTS', 5);
      var SQUAD_BENCH_SLOTS = exports('SQUAD_BENCH_SLOTS', 8);
      var SQUAD_SHOP_SLOTS = exports('SQUAD_SHOP_SLOTS', 3);

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/battlefield-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './squad-battle-config.ts', './unit-config.ts', './sprite-resolvers.ts', './unit-view.ts', './enemy-view.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Node, Vec3, Sprite, Color, UIOpacity, Label, Graphics, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _asyncToGenerator, SQUAD_UNIT_STATS, ENEMY_STATS, UNIT_CONFIG, UnitSpriteResolver, EnemySpriteResolver, BackgroundResolver, UnitView, EnemyView;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Node = module.Node;
      Vec3 = module.Vec3;
      Sprite = module.Sprite;
      Color = module.Color;
      UIOpacity = module.UIOpacity;
      Label = module.Label;
      Graphics = module.Graphics;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
    }, function (module) {
      SQUAD_UNIT_STATS = module.SQUAD_UNIT_STATS;
      ENEMY_STATS = module.ENEMY_STATS;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      UnitSpriteResolver = module.UnitSpriteResolver;
      EnemySpriteResolver = module.EnemySpriteResolver;
      BackgroundResolver = module.BackgroundResolver;
    }, function (module) {
      UnitView = module.UnitView;
    }, function (module) {
      EnemyView = module.EnemyView;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "902a1UizRBMlLoHD+K2Wk60", "battlefield-controller", undefined);

      var ccclass = _decorator.ccclass;
      var BattlefieldController = exports('BattlefieldController', (_dec = ccclass('BattlefieldController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BattlefieldController, _Component);

        function BattlefieldController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "unitResolver", new UnitSpriteResolver());

          _defineProperty(_assertThisInitialized(_this), "enemyResolver", new EnemySpriteResolver());

          _defineProperty(_assertThisInitialized(_this), "backgroundResolver", new BackgroundResolver());

          _defineProperty(_assertThisInitialized(_this), "allyViews", new Map());

          _defineProperty(_assertThisInitialized(_this), "enemyViews", new Map());

          _defineProperty(_assertThisInitialized(_this), "allyLayer", null);

          _defineProperty(_assertThisInitialized(_this), "enemyLayer", null);

          _defineProperty(_assertThisInitialized(_this), "commandLayer", null);

          _defineProperty(_assertThisInitialized(_this), "moveHint", null);

          _defineProperty(_assertThisInitialized(_this), "dimmer", null);

          _defineProperty(_assertThisInitialized(_this), "renderSerial", 0);

          _defineProperty(_assertThisInitialized(_this), "onGroundClick", void 0);

          _defineProperty(_assertThisInitialized(_this), "onAllyClick", void 0);

          _defineProperty(_assertThisInitialized(_this), "onEnemyClick", void 0);

          return _this;
        }

        var _proto = BattlefieldController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone,
              _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(920, 390);
          var bg = new Node('BattleBg');
          bg.layer = Layers.Enum.UI_2D;
          this.node.addChild(bg);
          bg.addComponent(UITransform).setContentSize(888, 348);
          bg.setPosition(new Vec3(0, 20, 0));
          var bgSprite = bg.addComponent(Sprite);
          bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          bgSprite.color = new Color(31, 79, 91, 255);
          void this.loadBackground(bgSprite);
          var dimNode = new Node('Dimmer');
          dimNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(dimNode);
          dimNode.addComponent(UITransform).setContentSize(888, 348);
          dimNode.setPosition(new Vec3(0, 20, 0));
          var dimSprite = dimNode.addComponent(Sprite);
          dimSprite.color = new Color(2, 6, 23, 255);
          this.dimmer = dimNode.addComponent(UIOpacity);
          this.dimmer.opacity = 42;
          var ground = new Node('GroundClick');
          ground.layer = Layers.Enum.UI_2D;
          this.node.addChild(ground);
          var groundTransform = ground.addComponent(UITransform);
          groundTransform.setContentSize(888, 348);
          ground.setPosition(new Vec3(0, 20, 0));
          ground.on(Node.EventType.TOUCH_END, function () {
            var _this2$onGroundClick;

            var event = arguments.length <= 0 ? undefined : arguments[0];
            var uiPoint = event.getUILocation();
            var local = groundTransform.convertToNodeSpaceAR(new Vec3(uiPoint.x, uiPoint.y, 0));
            var worldX = (local.x / 888 + 0.5) * 1200;
            var worldY = (0.5 - local.y / 348) * 700;
            (_this2$onGroundClick = _this2.onGroundClick) === null || _this2$onGroundClick === void 0 ? void 0 : _this2$onGroundClick.call(_this2, Math.max(0, Math.min(1200, worldX)), Math.max(0, Math.min(700, worldY)));
          }, this);
          this.commandLayer = new Node('CommandLayer');
          this.commandLayer.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.commandLayer);
          this.commandLayer.addComponent(UITransform).setContentSize(888, 348);
          this.allyLayer = new Node('Allies');
          this.allyLayer.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.allyLayer);
          this.enemyLayer = new Node('Enemies');
          this.enemyLayer.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.enemyLayer);
          this.moveHint = new Node('MoveHint');
          this.moveHint.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.moveHint);
          this.moveHint.addComponent(UITransform).setContentSize(20, 20);
          var hintSprite = this.moveHint.addComponent(Sprite);
          hintSprite.color = new Color(251, 191, 36, 220);
          this.moveHint.active = false;
          var title = new Node('Title');
          title.layer = Layers.Enum.UI_2D;
          this.node.addChild(title);
          title.addComponent(UITransform).setContentSize(500, 24);
          title.setPosition(new Vec3(-180, 198, 0));
          var label = title.addComponent(Label);
          label.fontSize = 14;
          label.string = '战场：点己方单位后，可点地面移动、点敌人集火、牧师点友军持续治疗';
          label.color = new Color(191, 219, 254, 255);
        };

        _proto.render = /*#__PURE__*/function () {
          var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(snapshot, selectedUnitId, moveMarker) {
            var _this3 = this;

            var serial, visibleAllies, visibleEnemies, _loop, _iterator, _step, _ret, _iterator2, _step2, enemy, pos;

            return regeneratorRuntime.wrap(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!(!this.allyLayer || !this.enemyLayer || !this.commandLayer)) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt("return");

                  case 2:
                    serial = ++this.renderSerial;
                    visibleAllies = new Set();
                    visibleEnemies = new Set();
                    this.commandLayer.removeAllChildren();
                    _loop = /*#__PURE__*/regeneratorRuntime.mark(function _loop() {
                      var ally, target, _target;

                      return regeneratorRuntime.wrap(function _loop$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              ally = _step.value;
                              visibleAllies.add(ally.instanceId);
                              _context.next = 4;
                              return _this3.createAlly(ally, selectedUnitId, snapshot.allies, serial);

                            case 4:
                              if (!(serial !== _this3.renderSerial)) {
                                _context.next = 6;
                                break;
                              }

                              return _context.abrupt("return", {
                                v: void 0
                              });

                            case 6:
                              if (ally.command.type === 'focus_enemy' && ally.command.targetEnemyId) {
                                target = snapshot.enemies.find(function (enemy) {
                                  return enemy.instanceId === ally.command.targetEnemyId;
                                });
                                if (target) _this3.createCommandVisual(ally.position, target.position, '集火', new Color(245, 158, 11, 255));
                              }

                              if (ally.command.type === 'channel_heal' && ally.command.targetAllyId) {
                                _target = snapshot.allies.find(function (other) {
                                  return other.instanceId === ally.command.targetAllyId;
                                });
                                if (_target) _this3.createCommandVisual(ally.position, _target.position, '治疗', new Color(96, 165, 250, 255));
                              }

                              if (ally.command.type === 'move' && ally.command.position) {
                                _this3.createCommandVisual(ally.position, ally.command.position, '移动', new Color(251, 191, 36, 255));
                              }

                            case 9:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _loop);
                    });
                    _iterator = _createForOfIteratorHelperLoose(snapshot.allies);

                  case 8:
                    if ((_step = _iterator()).done) {
                      _context2.next = 15;
                      break;
                    }

                    return _context2.delegateYield(_loop(), "t0", 10);

                  case 10:
                    _ret = _context2.t0;

                    if (!(typeof _ret === "object")) {
                      _context2.next = 13;
                      break;
                    }

                    return _context2.abrupt("return", _ret.v);

                  case 13:
                    _context2.next = 8;
                    break;

                  case 15:
                    _iterator2 = _createForOfIteratorHelperLoose(snapshot.enemies);

                  case 16:
                    if ((_step2 = _iterator2()).done) {
                      _context2.next = 25;
                      break;
                    }

                    enemy = _step2.value;
                    visibleEnemies.add(enemy.instanceId);
                    _context2.next = 21;
                    return this.createEnemy(enemy, serial);

                  case 21:
                    if (!(serial !== this.renderSerial)) {
                      _context2.next = 23;
                      break;
                    }

                    return _context2.abrupt("return");

                  case 23:
                    _context2.next = 16;
                    break;

                  case 25:
                    this.hideMissingViews(this.allyViews, visibleAllies);
                    this.hideMissingViews(this.enemyViews, visibleEnemies);

                    if (moveMarker && Date.now() <= moveMarker.until && this.moveHint) {
                      pos = this.worldToUi(moveMarker.x, moveMarker.y);
                      this.moveHint.active = true;
                      this.moveHint.setPosition(new Vec3(pos.x, pos.y, 0));
                    } else if (this.moveHint) {
                      this.moveHint.active = false;
                    }

                    if (this.dimmer) {
                      if (snapshot.uiState.battlefieldLighting === 'dim') {
                        this.dimmer.opacity = 42;
                      } else if (snapshot.uiState.battlefieldLighting === 'brightening') {
                        this.dimmer.opacity = Math.round((1 - snapshot.uiState.transitionProgress) * 42);
                      } else {
                        this.dimmer.opacity = 0;
                      }
                    }

                  case 29:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee, this);
          }));

          function render(_x, _x2, _x3) {
            return _render.apply(this, arguments);
          }

          return render;
        }();

        _proto.loadBackground = /*#__PURE__*/function () {
          var _loadBackground = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(bgSprite) {
            var frame;
            return regeneratorRuntime.wrap(function _callee2$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return this.backgroundResolver.resolve('battlefield_01');

                  case 2:
                    frame = _context3.sent;

                    if (frame) {
                      _context3.next = 5;
                      break;
                    }

                    return _context3.abrupt("return");

                  case 5:
                    bgSprite.spriteFrame = frame;
                    bgSprite.color = new Color(255, 255, 255, 255);

                  case 7:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee2, this);
          }));

          function loadBackground(_x4) {
            return _loadBackground.apply(this, arguments);
          }

          return loadBackground;
        }();

        _proto.createAlly = /*#__PURE__*/function () {
          var _createAlly = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ally, selectedUnitId, allies, serial) {
            var _this4 = this,
                _UNIT_CONFIG$ally$uni;

            var _this$getOrCreateAlly, node, view, pos, isDivineUnit, clip, frame, animationFrames, maxHp;

            return regeneratorRuntime.wrap(function _callee3$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (this.allyLayer) {
                      _context4.next = 2;
                      break;
                    }

                    return _context4.abrupt("return");

                  case 2:
                    _this$getOrCreateAlly = this.getOrCreateAllyView(ally.instanceId), node = _this$getOrCreateAlly.node, view = _this$getOrCreateAlly.view;

                    view.onClick = function () {
                      var _this4$onAllyClick;

                      return (_this4$onAllyClick = _this4.onAllyClick) === null || _this4$onAllyClick === void 0 ? void 0 : _this4$onAllyClick.call(_this4, ally.instanceId, allies);
                    };

                    pos = this.worldToUi(ally.position.x, ally.position.y);
                    node.setPosition(new Vec3(pos.x, pos.y, 0));
                    isDivineUnit = Boolean((_UNIT_CONFIG$ally$uni = UNIT_CONFIG[ally.unitId]) === null || _UNIT_CONFIG$ally$uni === void 0 ? void 0 : _UNIT_CONFIG$ally$uni.isDivine);
                    clip = this.getUnitAnimationClip(ally);
                    _context4.next = 10;
                    return this.unitResolver.resolve(ally.unitId, ally.star, isDivineUnit);

                  case 10:
                    frame = _context4.sent;
                    _context4.next = 13;
                    return this.unitResolver.resolveAnimation(ally.unitId, clip, isDivineUnit);

                  case 13:
                    animationFrames = _context4.sent;

                    if (!(serial !== this.renderSerial || !node.parent)) {
                      _context4.next = 16;
                      break;
                    }

                    return _context4.abrupt("return");

                  case 16:
                    maxHp = this.getAllyMaxHp(ally);
                    view.render(ally, maxHp, selectedUnitId === ally.instanceId, frame, animationFrames);

                  case 18:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee3, this);
          }));

          function createAlly(_x5, _x6, _x7, _x8) {
            return _createAlly.apply(this, arguments);
          }

          return createAlly;
        }();

        _proto.createEnemy = /*#__PURE__*/function () {
          var _createEnemy = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(enemy, serial) {
            var _this5 = this;

            var _this$getOrCreateEnem, node, view, pos, clip, frame, animationFrames, maxHp;

            return regeneratorRuntime.wrap(function _callee4$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    if (this.enemyLayer) {
                      _context5.next = 2;
                      break;
                    }

                    return _context5.abrupt("return");

                  case 2:
                    _this$getOrCreateEnem = this.getOrCreateEnemyView(enemy.instanceId), node = _this$getOrCreateEnem.node, view = _this$getOrCreateEnem.view;

                    view.onClick = function () {
                      var _this5$onEnemyClick;

                      return (_this5$onEnemyClick = _this5.onEnemyClick) === null || _this5$onEnemyClick === void 0 ? void 0 : _this5$onEnemyClick.call(_this5, enemy.instanceId);
                    };

                    pos = this.worldToUi(enemy.position.x, enemy.position.y);
                    node.setPosition(new Vec3(pos.x, pos.y, 0));
                    clip = this.getEnemyAnimationClip(enemy);
                    _context5.next = 9;
                    return this.enemyResolver.resolve(enemy.enemyType);

                  case 9:
                    frame = _context5.sent;
                    _context5.next = 12;
                    return this.enemyResolver.resolveAnimation(enemy.enemyType, clip);

                  case 12:
                    animationFrames = _context5.sent;

                    if (!(serial !== this.renderSerial || !node.parent)) {
                      _context5.next = 15;
                      break;
                    }

                    return _context5.abrupt("return");

                  case 15:
                    maxHp = ENEMY_STATS[enemy.enemyType].maxHp;
                    view.render(enemy, maxHp, frame, animationFrames);

                  case 17:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee4, this);
          }));

          function createEnemy(_x9, _x10) {
            return _createEnemy.apply(this, arguments);
          }

          return createEnemy;
        }();

        _proto.getOrCreateAllyView = function getOrCreateAllyView(instanceId) {
          var cached = this.allyViews.get(instanceId);

          if (cached) {
            cached.node.active = true;
            if (!cached.node.parent && this.allyLayer) this.allyLayer.addChild(cached.node);
            return cached;
          }

          var node = new Node("Ally-" + instanceId);
          if (this.allyLayer) this.allyLayer.addChild(node);
          var view = node.addComponent(UnitView);
          view.setup();
          var entry = {
            node: node,
            view: view
          };
          this.allyViews.set(instanceId, entry);
          return entry;
        };

        _proto.getOrCreateEnemyView = function getOrCreateEnemyView(instanceId) {
          var cached = this.enemyViews.get(instanceId);

          if (cached) {
            cached.node.active = true;
            if (!cached.node.parent && this.enemyLayer) this.enemyLayer.addChild(cached.node);
            return cached;
          }

          var node = new Node("Enemy-" + instanceId);
          if (this.enemyLayer) this.enemyLayer.addChild(node);
          var view = node.addComponent(EnemyView);
          view.setup();
          var entry = {
            node: node,
            view: view
          };
          this.enemyViews.set(instanceId, entry);
          return entry;
        };

        _proto.hideMissingViews = function hideMissingViews(views, visibleIds) {
          for (var _iterator3 = _createForOfIteratorHelperLoose(views), _step3; !(_step3 = _iterator3()).done;) {
            var _step3$value = _step3.value,
                instanceId = _step3$value[0],
                entry = _step3$value[1];

            if (!visibleIds.has(instanceId)) {
              entry.node.active = false;
            }
          }
        };

        _proto.getUnitAnimationClip = function getUnitAnimationClip(unit) {
          if (!unit.alive) return 'death_fall';
          if (unit.attackCooldownLeft > 0 || unit.command.type === 'channel_heal') return 'attack';
          if (Math.hypot(unit.velocity.x, unit.velocity.y) > 1 || unit.command.type === 'move') return 'move';
          return 'move';
        };

        _proto.getEnemyAnimationClip = function getEnemyAnimationClip(enemy) {
          if (!enemy.alive) return 'death_fall';
          if (enemy.attackCooldownLeft > 0) return 'attack';
          if (Math.hypot(enemy.velocity.x, enemy.velocity.y) > 1) return 'move';
          return 'move';
        };

        _proto.createCommandVisual = function createCommandVisual(from, to, text, color) {
          if (!this.commandLayer) return;
          var fromPos = this.worldToUi(from.x, from.y);
          var toPos = this.worldToUi(to.x, to.y);
          var lineNode = new Node("CmdLine-" + text);
          this.commandLayer.addChild(lineNode);
          lineNode.addComponent(UITransform).setContentSize(888, 348);
          var graphics = lineNode.addComponent(Graphics);
          graphics.lineWidth = 3;
          graphics.strokeColor = color;
          graphics.moveTo(fromPos.x, fromPos.y);
          graphics.lineTo(toPos.x, toPos.y);
          graphics.stroke();
          var markerNode = new Node("CmdMarker-" + text);
          this.commandLayer.addChild(markerNode);
          markerNode.setPosition(new Vec3(toPos.x, toPos.y, 0));
          markerNode.addComponent(UITransform).setContentSize(20, 20);
          var marker = markerNode.addComponent(Graphics);
          marker.fillColor = color;
          marker.circle(0, 0, 6);
          marker.fill();
          var node = new Node("CmdLabel-" + text);
          this.commandLayer.addChild(node);
          node.addComponent(UITransform).setContentSize(120, 20);
          node.setPosition(new Vec3((fromPos.x + toPos.x) / 2, (fromPos.y + toPos.y) / 2 + 18, 0));
          var label = node.addComponent(Label);
          label.string = "" + text;
          label.fontSize = 11;
          label.color = color;
        };

        _proto.worldToUi = function worldToUi(worldX, worldY) {
          return {
            x: (worldX / 1200 - 0.5) * 888,
            y: (0.5 - worldY / 700) * 348 + 20
          };
        };

        _proto.getAllyMaxHp = function getAllyMaxHp(unit) {
          var base = SQUAD_UNIT_STATS[unit.unitId].maxHp;
          return Math.round(base * (1 + (unit.star - 1) * 0.7));
        };

        return BattlefieldController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/healing-system.ts", ['cc', './math.ts', './squad-battle-config.ts'], function (exports) {
  'use strict';

  var cclegacy, distance, SQUAD_UNIT_STATS;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
    }, function (module) {
      SQUAD_UNIT_STATS = module.SQUAD_UNIT_STATS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "9cf335Kl4BN/5YmEcoeT80O", "healing-system", undefined);

      var HealingSystem = exports('HealingSystem', /*#__PURE__*/function () {
        function HealingSystem() {}

        var _proto = HealingSystem.prototype;

        _proto.healIfPossible = function healIfPossible(priest, ally) {
          var _cfg$healPower;

          if (!priest.alive || !ally.alive) return {
            casted: false,
            actualHeal: 0
          };
          var cfg = SQUAD_UNIT_STATS[priest.unitId];
          var scaledHeal = ((_cfg$healPower = cfg.healPower) !== null && _cfg$healPower !== void 0 ? _cfg$healPower : 0) * priest.star;
          if (scaledHeal <= 0 || priest.attackCooldownLeft > 0) return {
            casted: false,
            actualHeal: 0
          };
          var dist = distance(priest.position, ally.position);

          if (dist > cfg.attackRange) {
            return {
              casted: false,
              actualHeal: 0
            };
          } // 满血也保持治疗动作：这里仍触发冷却并维持 channel 语义。


          var maxHp = SQUAD_UNIT_STATS[ally.unitId].maxHp;
          var before = ally.currentHp;
          ally.currentHp = Math.min(maxHp, ally.currentHp + scaledHeal);
          var actualHeal = Math.max(0, ally.currentHp - before);
          priest.attackCooldownLeft = cfg.attackInterval;
          return {
            casted: true,
            actualHeal: actualHeal
          };
        };

        return HealingSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/types2.ts", ['cc'], function () {
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

System.register("chunks:///_virtual/battle-scene-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './unit-config.ts', './battle-hud-controller.ts', './squad-battle-session.ts', './local-profile-storage.ts', './prep-panel-controller.ts', './battlefield-controller.ts', './character-select-controller.ts', './command-overlay-controller.ts', './main-menu-controller.ts', './wave-transition-controller.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, director, Node, Layers, UITransform, Vec3, Canvas, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, _createForOfIteratorHelperLoose, _extends, SHOP_UNIT_POOL, UNIT_CONFIG, BattleHudController, SquadBattleSession, LocalProfileStorage, PrepPanelController, BattlefieldController, CharacterSelectController, CommandOverlayController, MainMenuController, WaveTransitionController;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      director = module.director;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
      Canvas = module.Canvas;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _extends = module.extends;
    }, function (module) {
      SHOP_UNIT_POOL = module.SHOP_UNIT_POOL;
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      BattleHudController = module.BattleHudController;
    }, function (module) {
      SquadBattleSession = module.SquadBattleSession;
    }, function (module) {
      LocalProfileStorage = module.LocalProfileStorage;
    }, function (module) {
      PrepPanelController = module.PrepPanelController;
    }, function (module) {
      BattlefieldController = module.BattlefieldController;
    }, function (module) {
      CharacterSelectController = module.CharacterSelectController;
    }, function (module) {
      CommandOverlayController = module.CommandOverlayController;
    }, function (module) {
      MainMenuController = module.MainMenuController;
    }, function (module) {
      WaveTransitionController = module.WaveTransitionController;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "a8bd7X+JBFBRKNN4L6rnOJy", "battle-scene-controller", undefined);

      var ccclass = _decorator.ccclass;
      var BattleSceneController = exports('BattleSceneController', (_dec = ccclass('BattleSceneController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BattleSceneController, _Component);

        function BattleSceneController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "session", new SquadBattleSession());

          _defineProperty(_assertThisInitialized(_this), "storage", new LocalProfileStorage());

          _defineProperty(_assertThisInitialized(_this), "mode", 'menu');

          _defineProperty(_assertThisInitialized(_this), "rootNode", null);

          _defineProperty(_assertThisInitialized(_this), "menuController", null);

          _defineProperty(_assertThisInitialized(_this), "selectController", null);

          _defineProperty(_assertThisInitialized(_this), "settings", {
            master: 80,
            music: 70,
            sfx: 80
          });

          _defineProperty(_assertThisInitialized(_this), "achievements", {
            firstClear: false
          });

          _defineProperty(_assertThisInitialized(_this), "selectedStarterUnitId", SHOP_UNIT_POOL[0]);

          _defineProperty(_assertThisInitialized(_this), "selectedUnitId", void 0);

          _defineProperty(_assertThisInitialized(_this), "transientNotice", null);

          _defineProperty(_assertThisInitialized(_this), "moveMarker", null);

          _defineProperty(_assertThisInitialized(_this), "hudController", null);

          _defineProperty(_assertThisInitialized(_this), "prepController", null);

          _defineProperty(_assertThisInitialized(_this), "fieldController", null);

          _defineProperty(_assertThisInitialized(_this), "transitionController", null);

          _defineProperty(_assertThisInitialized(_this), "commandOverlayController", null);

          return _this;
        }

        var _proto = BattleSceneController.prototype;

        _proto.onLoad = function onLoad() {
          var _this2 = this;

          this.hideRuntimeProfiler();
          this.settings = this.storage.loadSettings();
          this.achievements = this.storage.loadAchievements();

          this.session.onVictory = function () {
            return _this2.unlockFirstClearAchievement();
          };

          this.ensureMenuGraph();
        };

        _proto.update = function update(dt) {
          if (this.mode !== 'battle') {
            return;
          }

          var outcome = this.session.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));

          if (outcome.advancedWave || outcome.changedPhase) {
            this.persistRun();
          }

          this.render();
        };

        _proto.ensureMenuGraph = function ensureMenuGraph() {
          var _this3 = this;

          var scene = director.getScene();
          var canvasNode = scene ? this.findCanvasNode(scene) : null;
          var parent = canvasNode !== null && canvasNode !== void 0 ? canvasNode : this.node;
          var root = new Node('BattleSceneRoot');
          root.layer = Layers.Enum.UI_2D;
          root.addComponent(UITransform).setContentSize(960, 640);
          parent.addChild(root);
          this.rootNode = root;
          var menuNode = new Node('MainMenu');
          menuNode.layer = Layers.Enum.UI_2D;
          menuNode.addComponent(UITransform).setContentSize(960, 640);
          root.addChild(menuNode);
          this.menuController = menuNode.addComponent(MainMenuController);
          this.menuController.initialize();

          this.menuController.onStart = function () {
            return _this3.startFromMainMenu();
          };

          this.menuController.onLoadRequested = function () {
            return _this3.loadFromMenu();
          };

          this.menuController.onSettingAdjusted = function (key, nextValue) {
            return _this3.updateSetting(key, nextValue);
          };

          this.menuController.setSettings(this.settings);
          this.menuController.setAchievements(this.achievements);
          this.menuController.setHasRunSave(this.storage.hasRunSave());
          this.menuController.setFooterText('当前版本：先从开始界面进入，再进入准备阶段。');
          var selectNode = new Node('CharacterSelect');
          selectNode.layer = Layers.Enum.UI_2D;
          selectNode.addComponent(UITransform).setContentSize(960, 640);
          root.addChild(selectNode);
          selectNode.active = false;
          this.selectController = selectNode.addComponent(CharacterSelectController);
          this.selectController.initialize();
          this.selectController.setOptions(SHOP_UNIT_POOL, this.selectedStarterUnitId);

          this.selectController.onBack = function () {
            return _this3.backToMainMenu();
          };

          this.selectController.onConfirm = function (unitId) {
            return _this3.startBattleRunWithStarter(unitId);
          };
        };

        _proto.ensureSceneGraph = function ensureSceneGraph() {
          var _this4 = this;

          if (!this.rootNode) {
            this.ensureMenuGraph();
          }

          var root = this.rootNode;

          if (!root) {
            return;
          }

          if (this.hudController || this.prepController || this.fieldController || this.transitionController || this.commandOverlayController) {
            return;
          }

          var battleNode = new Node('Battlefield');
          battleNode.layer = Layers.Enum.UI_2D;
          battleNode.addComponent(UITransform).setContentSize(920, 400);
          battleNode.setPosition(new Vec3(0, 108, 0));
          root.addChild(battleNode);
          var hudNode = new Node('Hud');
          hudNode.layer = Layers.Enum.UI_2D;
          hudNode.addComponent(UITransform).setContentSize(920, 150);
          hudNode.setPosition(new Vec3(0, 244, 0));
          root.addChild(hudNode);
          var prepNode = new Node('PrepPanel');
          prepNode.layer = Layers.Enum.UI_2D;
          prepNode.addComponent(UITransform).setContentSize(920, 240);
          prepNode.setPosition(new Vec3(0, -120, 0));
          root.addChild(prepNode);
          var cmdNode = new Node('CommandOverlay');
          cmdNode.layer = Layers.Enum.UI_2D;
          cmdNode.addComponent(UITransform).setContentSize(920, 40);
          cmdNode.setPosition(new Vec3(0, 164, 0));
          root.addChild(cmdNode);
          this.hudController = hudNode.addComponent(BattleHudController);
          this.hudController.initialize();
          this.prepController = prepNode.addComponent(PrepPanelController);
          this.prepController.initialize();

          this.prepController.onBuy = function (index) {
            return _this4.onBuy(index);
          };

          this.prepController.onDeploy = function (id) {
            return _this4.onDeploy(id);
          };

          this.prepController.onRecall = function (id) {
            return _this4.onRecall(id);
          };

          this.prepController.onSell = function () {
            return _this4.onSell();
          };

          this.prepController.onRefresh = function () {
            return _this4.onRefresh();
          };

          this.prepController.onStartWave = function () {
            return _this4.onStartWave();
          };

          this.fieldController = battleNode.addComponent(BattlefieldController);
          this.fieldController.initialize();

          this.fieldController.onGroundClick = function (x, y) {
            return _this4.onGroundClicked(x, y);
          };

          this.fieldController.onEnemyClick = function (enemyId) {
            return _this4.onEnemyClicked(enemyId);
          };

          this.fieldController.onAllyClick = function (allyId, allies) {
            return _this4.onAllyClicked(allyId, allies);
          };

          this.transitionController = root.addComponent(WaveTransitionController);
          this.transitionController.bind(prepNode, battleNode);
          this.commandOverlayController = cmdNode.addComponent(CommandOverlayController);
          this.commandOverlayController.initialize();
        };

        _proto.startFromMainMenu = function startFromMainMenu() {
          this.mode = 'select';

          if (this.menuController) {
            this.menuController.hidePanel();
            this.menuController.node.active = false;
          }

          if (this.selectController) {
            this.selectController.node.active = true;
            this.selectController.setOptions(SHOP_UNIT_POOL, this.selectedStarterUnitId);
          }
        };

        _proto.backToMainMenu = function backToMainMenu() {
          this.mode = 'menu';

          if (this.selectController) {
            this.selectController.node.active = false;
          }

          if (this.menuController) {
            this.menuController.node.active = true;
            this.menuController.setFooterText('已返回主菜单。点击开始后先选职业，再进入第一回合。');
          }
        };

        _proto.startBattleRunWithStarter = function startBattleRunWithStarter(unitId) {
          this.selectedStarterUnitId = unitId;
          this.session.startNewRun('beginner', unitId);
          this.mode = 'battle';
          this.selectedUnitId = undefined;
          this.moveMarker = null;
          this.transientNotice = null;
          this.ensureSceneGraph();

          if (this.selectController) {
            this.selectController.node.active = false;
          }

          if (this.menuController) {
            this.menuController.hidePanel();
            this.menuController.node.active = false;
          }

          this.pushNotice("\u5DF2\u9009\u62E9 " + UNIT_CONFIG[unitId].name + " \u4F5C\u4E3A\u8D77\u59CB\u961F\u957F\uFF0C\u5148\u8D2D\u4E70\u5E76\u4E0A\u9635\uFF0C\u81F3\u5C11 1 \u4EBA\u540E\u5F00\u59CB\u4E0B\u4E00\u6CE2\u3002", 2400);
          this.persistRun();
          this.render();
        };

        _proto.loadFromMenu = function loadFromMenu() {
          var _save$selectedStarter;

          var save = this.storage.loadRun();

          if (!save) {
            var _this$menuController, _this$menuController2;

            (_this$menuController = this.menuController) === null || _this$menuController === void 0 ? void 0 : _this$menuController.setHasRunSave(false);
            (_this$menuController2 = this.menuController) === null || _this$menuController2 === void 0 ? void 0 : _this$menuController2.setFooterText('未找到可用存档。先开始一局，系统会自动保存关键进度。');
            return;
          }

          if (!this.session.loadFromSaveData(save)) {
            var _this$menuController3;

            (_this$menuController3 = this.menuController) === null || _this$menuController3 === void 0 ? void 0 : _this$menuController3.setFooterText('载入失败：存档内容不兼容。');
            return;
          }

          this.mode = 'battle';
          this.selectedUnitId = undefined;
          this.moveMarker = null;
          this.transientNotice = null;
          this.selectedStarterUnitId = (_save$selectedStarter = save.selectedStarterUnitId) !== null && _save$selectedStarter !== void 0 ? _save$selectedStarter : this.selectedStarterUnitId;
          this.ensureSceneGraph();

          if (this.menuController) {
            this.menuController.hidePanel();
            this.menuController.node.active = false;
          }

          if (this.selectController) {
            this.selectController.node.active = false;
          }

          this.pushNotice("\u5DF2\u8F7D\u5165\u5B58\u6863\uFF1A\u6CE2\u6B21 " + save.waveNumber + "\uFF0C\u9636\u6BB5 " + save.phase + "\u3002", 2200);
          this.render();
        };

        _proto.render = function render() {
          var _this$getSelectedUnit, _this$hudController, _this$prepController, _this$fieldController, _this$transitionContr, _this$commandOverlayC;

          var snap = this.session.getSnapshot();
          this.syncSelection(snap);
          var selectedLabel = (_this$getSelectedUnit = this.getSelectedUnitLabel(snap)) !== null && _this$getSelectedUnit !== void 0 ? _this$getSelectedUnit : 'none';
          var notice = this.getNoticeText(snap);
          (_this$hudController = this.hudController) === null || _this$hudController === void 0 ? void 0 : _this$hudController.render(snap, selectedLabel, notice);
          (_this$prepController = this.prepController) === null || _this$prepController === void 0 ? void 0 : _this$prepController.render(snap, selectedLabel, this.selectedUnitId);
          (_this$fieldController = this.fieldController) === null || _this$fieldController === void 0 ? void 0 : _this$fieldController.render(snap, this.selectedUnitId, this.moveMarker);
          (_this$transitionContr = this.transitionController) === null || _this$transitionContr === void 0 ? void 0 : _this$transitionContr.sync(snap);
          (_this$commandOverlayC = this.commandOverlayController) === null || _this$commandOverlayC === void 0 ? void 0 : _this$commandOverlayC.setNotice(notice);
        };

        _proto.syncSelection = function syncSelection(snap) {
          var _this5 = this;

          if (!this.selectedUnitId) return;
          var stillExists = [].concat(snap.bench, snap.deployed, snap.allies).some(function (unit) {
            return unit.instanceId === _this5.selectedUnitId;
          });

          if (!stillExists) {
            this.selectedUnitId = undefined;
          }
        };

        _proto.onGroundClicked = function onGroundClicked(worldX, worldY) {
          if (!this.selectedUnitId) return;
          this.session.selectUnit(this.selectedUnitId);
          var issued = this.session.commandMoveToGround({
            x: worldX,
            y: worldY
          });

          if (!issued) {
            this.pushNotice('移动命令失败：当前选中单位不能执行移动。');
            return;
          }

          this.moveMarker = {
            x: worldX,
            y: worldY,
            until: Date.now() + 900
          };
          this.pushNotice("\u5DF2\u4E0B\u8FBE\u79FB\u52A8\u547D\u4EE4\uFF1A(" + Math.round(worldX) + ", " + Math.round(worldY) + ")", 1200);
          this.persistRun();
        };

        _proto.onEnemyClicked = function onEnemyClicked(enemyInstanceId) {
          if (!this.selectedUnitId) return;
          this.session.selectUnit(this.selectedUnitId);
          var issued = this.session.commandFocusEnemy(enemyInstanceId);
          this.pushNotice(issued ? "\u5DF2\u4E0B\u8FBE\u96C6\u706B\u547D\u4EE4\uFF1A\u76EE\u6807 " + enemyInstanceId.slice(-4) : '命令失败：当前选中单位无法执行集火。');
          if (issued) this.persistRun();
        };

        _proto.onAllyClicked = function onAllyClicked(allyInstanceId, allies) {
          var _this6 = this,
              _ally$unitId;

          var selectedUnit = allies.find(function (ally) {
            return ally.instanceId === _this6.selectedUnitId;
          });

          if ((selectedUnit === null || selectedUnit === void 0 ? void 0 : selectedUnit.role) === 'priest' && this.selectedUnitId) {
            this.session.selectUnit(this.selectedUnitId);
            var issued = this.session.commandPriestHeal(allyInstanceId);
            this.pushNotice(issued ? "\u5DF2\u4E0B\u8FBE\u6301\u7EED\u6CBB\u7597\uFF1A" + allyInstanceId.slice(-4) : '治疗命令失败：仅牧师可对友军持续治疗。');
            if (issued) this.persistRun();
            return;
          }

          this.selectedUnitId = allyInstanceId;
          var ally = allies.find(function (u) {
            return u.instanceId === allyInstanceId;
          });
          this.pushNotice("\u5DF2\u9009\u4E2D\u6218\u573A\u5355\u4F4D\uFF1A" + ((_ally$unitId = ally === null || ally === void 0 ? void 0 : ally.unitId) !== null && _ally$unitId !== void 0 ? _ally$unitId : allyInstanceId.slice(-4)) + (ally ? "\u2605" + ally.star : ''), 1200);
        };

        _proto.onBuy = function onBuy(slotIndex) {
          var snap = this.session.getSnapshot();
          var unitId = snap.shop[slotIndex];
          var bought = this.session.buyShopUnit(slotIndex);
          this.pushNotice(bought ? "\u8D2D\u4E70\u6210\u529F\uFF1A" + unitId : this.getBuyFailureReason(slotIndex));
          if (bought) this.persistRun();
        };

        _proto.onDeploy = function onDeploy(instanceId) {
          var snap = this.session.getSnapshot();
          var unit = snap.bench.find(function (u) {
            return u.instanceId === instanceId;
          });
          var deployed = this.session.deployFromBench(instanceId);

          if (deployed) {
            var _unit$unitId;

            this.selectedUnitId = instanceId;
            this.pushNotice("\u5DF2\u4E0A\u9635\uFF1A" + ((_unit$unitId = unit === null || unit === void 0 ? void 0 : unit.unitId) !== null && _unit$unitId !== void 0 ? _unit$unitId : instanceId.slice(-4)) + (unit ? "\u2605" + unit.star : ''));
            this.persistRun();
            return;
          }

          this.pushNotice('上阵失败：上阵位已满或单位不存在。');
        };

        _proto.onRecall = function onRecall(instanceId) {
          var snap = this.session.getSnapshot();
          var unit = snap.deployed.find(function (u) {
            return u.instanceId === instanceId;
          });
          var recalled = this.session.recallFromDeployed(instanceId);

          if (recalled) {
            var _unit$unitId2;

            this.selectedUnitId = instanceId;
            this.pushNotice("\u5DF2\u64A4\u56DE\uFF1A" + ((_unit$unitId2 = unit === null || unit === void 0 ? void 0 : unit.unitId) !== null && _unit$unitId2 !== void 0 ? _unit$unitId2 : instanceId.slice(-4)) + (unit ? "\u2605" + unit.star : ''));
            this.persistRun();
            return;
          }

          this.pushNotice('撤回失败：单位不存在。');
        };

        _proto.onSell = function onSell() {
          if (!this.selectedUnitId) {
            this.pushNotice('卖出失败：请先选中单位。');
            return;
          }

          var sold = this.session.sellUnit(this.selectedUnitId);

          if (sold) {
            this.pushNotice('已卖出当前选中单位。');
            this.selectedUnitId = undefined;
            this.persistRun();
            return;
          }

          this.pushNotice('卖出失败：当前选中单位不可卖出。');
        };

        _proto.onRefresh = function onRefresh() {
          var refreshed = this.session.refreshShopByCost();
          this.pushNotice(refreshed ? '商店已刷新。' : '刷新失败：金币不足或当前不在准备阶段。');
          if (refreshed) this.persistRun();
        };

        _proto.onStartWave = function onStartWave() {
          var started = this.session.startNextWaveFromPrep();
          this.pushNotice(started ? '已开始下一波。' : '开始失败：至少需要 1 名已上阵单位，且当前必须处于准备阶段。');
          if (started) this.persistRun();
        };

        _proto.findCanvasNode = function findCanvasNode(root) {
          if (root.getComponent(Canvas)) return root;

          for (var _iterator = _createForOfIteratorHelperLoose(root.children), _step; !(_step = _iterator()).done;) {
            var child = _step.value;
            var found = this.findCanvasNode(child);
            if (found) return found;
          }

          return null;
        };

        _proto.hideRuntimeProfiler = function hideRuntimeProfiler() {
          var _runtimeGlobal$cc, _runtimeGlobal$cc$pro, _runtimeGlobal$cc$pro2;

          var runtimeGlobal = globalThis;
          (_runtimeGlobal$cc = runtimeGlobal.cc) === null || _runtimeGlobal$cc === void 0 ? void 0 : (_runtimeGlobal$cc$pro = _runtimeGlobal$cc.profiler) === null || _runtimeGlobal$cc$pro === void 0 ? void 0 : (_runtimeGlobal$cc$pro2 = _runtimeGlobal$cc$pro.hideStats) === null || _runtimeGlobal$cc$pro2 === void 0 ? void 0 : _runtimeGlobal$cc$pro2.call(_runtimeGlobal$cc$pro);
        };

        _proto.pushNotice = function pushNotice(message, durationMs) {
          if (durationMs === void 0) {
            durationMs = 1600;
          }

          this.transientNotice = {
            message: message,
            until: Date.now() + durationMs
          };
        };

        _proto.getNoticeText = function getNoticeText(snap) {
          var _this$transientNotice, _this$transientNotice2;

          if (this.transientNotice && Date.now() > this.transientNotice.until) {
            this.transientNotice = null;
          }

          var selected = this.getSelectedUnitLabel(snap);
          return (_this$transientNotice = (_this$transientNotice2 = this.transientNotice) === null || _this$transientNotice2 === void 0 ? void 0 : _this$transientNotice2.message) !== null && _this$transientNotice !== void 0 ? _this$transientNotice : selected ? this.getSelectedHint(snap, selected) : snap.phase === 'prep' ? '准备阶段：购买 3 个同星同单位会自动合成；先上阵至少 1 人再开始下一波。' : '战斗阶段：点己方单位后，再点地面移动、点敌人集火、点友军为牧师持续治疗。';
        };

        _proto.getSelectedHint = function getSelectedHint(snap, selected) {
          var _this7 = this;

          var rosterUnit = [].concat(snap.bench, snap.deployed).find(function (u) {
            return u.instanceId === _this7.selectedUnitId;
          });

          if (rosterUnit) {
            var _task$divineProgress;

            var location = snap.deployed.some(function (u) {
              return u.instanceId === rosterUnit.instanceId;
            }) ? '上阵区' : '备战区';
            var task = snap.divineTasks.find(function (entry) {
              return entry.unitInstanceId === rosterUnit.instanceId;
            });
            return task ? "\u5DF2\u9009\u4E2D " + selected + "\uFF0C\u4F4D\u4E8E" + location + "\u3002\u8BE5\u5B9E\u4F8B\u6709\u795E\u54C1\u4EFB\u52A1 " + task.divineTaskId + "\uFF0C\u5F53\u524D\u8FDB\u5EA6 " + Math.floor((_task$divineProgress = task.divineProgress) !== null && _task$divineProgress !== void 0 ? _task$divineProgress : 0) + "\u3002" : "\u5DF2\u9009\u4E2D " + selected + "\uFF0C\u4F4D\u4E8E" + location + "\u3002\u51C6\u5907\u9636\u6BB5\u53EF\u5356\u51FA/\u4E0A\u9635/\u64A4\u56DE\uFF0C3 \u540C\u661F\u540C\u5355\u4F4D\u4F1A\u81EA\u52A8\u5408\u6210\u3002";
          }

          var battleUnit = snap.allies.find(function (u) {
            return u.instanceId === _this7.selectedUnitId;
          });

          if (!battleUnit) {
            return "\u5DF2\u9009\u4E2D " + selected + "\u3002";
          }

          if (battleUnit.role === 'priest') {
            return "\u5DF2\u9009\u4E2D " + selected + "\u3002\u7267\u5E08\u4E0D\u4F1A\u81EA\u52A8\u653B\u51FB\uFF0C\u8BF7\u70B9\u53CB\u519B\u4E0B\u8FBE\u6301\u7EED\u6CBB\u7597\uFF0C\u6216\u70B9\u5730\u9762\u91CD\u65B0\u8D70\u4F4D\u3002";
          }

          if (battleUnit.command.type === 'focus_enemy') {
            return "\u5DF2\u9009\u4E2D " + selected + "\u3002\u5F53\u524D\u5904\u4E8E\u96C6\u706B\u547D\u4EE4\u72B6\u6001\uFF0C\u53EF\u6539\u70B9\u5730\u9762\u79FB\u52A8\u6216\u6539\u70B9\u5176\u4ED6\u654C\u4EBA\u3002";
          }

          if (battleUnit.command.type === 'move') {
            return "\u5DF2\u9009\u4E2D " + selected + "\u3002\u5F53\u524D\u5904\u4E8E\u79FB\u52A8\u547D\u4EE4\u72B6\u6001\uFF0C\u53EF\u6539\u70B9\u654C\u4EBA\u96C6\u706B\u6216\u7EE7\u7EED\u91CD\u5B9A\u5411\u8D70\u4F4D\u3002";
          }

          return "\u5DF2\u9009\u4E2D " + selected + "\u3002\u6218\u6597\u9636\u6BB5\u53EF\u70B9\u5730\u9762\u79FB\u52A8\u3001\u70B9\u654C\u4EBA\u96C6\u706B\uFF1B\u8FD1\u6218\u53EA\u4F1A\u77ED\u8DDD\u79BB\u53CD\u5E94\uFF0C\u8FDC\u7A0B\u4E0D\u4F1A\u81EA\u52A8\u6EE1\u56FE\u8FFD\u51FB\u3002";
        };

        _proto.getSelectedUnitLabel = function getSelectedUnitLabel(snap) {
          var _this8 = this;

          if (!this.selectedUnitId) return undefined;
          var rosterUnit = [].concat(snap.deployed, snap.bench).find(function (u) {
            return u.instanceId === _this8.selectedUnitId;
          });

          if (rosterUnit) {
            var source = snap.deployed.some(function (u) {
              return u.instanceId === _this8.selectedUnitId;
            }) ? 'deployed' : 'bench';
            return rosterUnit.unitId + "\u2605" + rosterUnit.star + " [" + source + "]";
          }

          var battleUnit = snap.allies.find(function (u) {
            return u.instanceId === _this8.selectedUnitId;
          });

          if (battleUnit) {
            return battleUnit.unitId + "\u2605" + battleUnit.star + " [battle]";
          }

          return undefined;
        };

        _proto.getBuyFailureReason = function getBuyFailureReason(slotIndex) {
          var snap = this.session.getSnapshot();
          var unitId = snap.shop[slotIndex];
          if (!unitId) return '购买失败：商店槽位为空。';
          if (snap.phase !== 'prep') return '购买失败：当前不在准备阶段。';
          if (snap.bench.length >= snap.slotConfig.bench) return '购买失败：备战区已满。';
          var cost = UNIT_CONFIG[unitId].cost;
          if (snap.gold < cost) return "\u8D2D\u4E70\u5931\u8D25\uFF1A\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u9700\u8981 " + cost + "\u3002";
          return '购买失败：该单位未能加入备战区。';
        };

        _proto.updateSetting = function updateSetting(key, nextValue) {
          var _extends2, _this$menuController4, _this$menuController5;

          this.settings = _extends({}, this.settings, (_extends2 = {}, _extends2[key] = nextValue, _extends2));
          this.storage.saveSettings(this.settings);
          (_this$menuController4 = this.menuController) === null || _this$menuController4 === void 0 ? void 0 : _this$menuController4.setSettings(this.settings);
          (_this$menuController5 = this.menuController) === null || _this$menuController5 === void 0 ? void 0 : _this$menuController5.setFooterText("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\uFF1A" + this.getSettingLabel(key) + " " + nextValue + "%");
        };

        _proto.getSettingLabel = function getSettingLabel(key) {
          if (key === 'master') return '总音量';
          if (key === 'music') return '音乐';
          return '音效';
        };

        _proto.unlockFirstClearAchievement = function unlockFirstClearAchievement() {
          var _this$menuController6;

          if (this.achievements.firstClear) return;
          this.achievements = _extends({}, this.achievements, {
            firstClear: true
          });
          this.storage.saveAchievements(this.achievements);
          (_this$menuController6 = this.menuController) === null || _this$menuController6 === void 0 ? void 0 : _this$menuController6.setAchievements(this.achievements);
          this.pushNotice('成就解锁：初次通关。', 2200);
          this.persistRun();
        };

        _proto.persistRun = function persistRun() {
          var _this$menuController7;

          if (this.mode !== 'battle') return;
          this.storage.saveRun(this.session.exportSaveData());
          (_this$menuController7 = this.menuController) === null || _this$menuController7 === void 0 ? void 0 : _this$menuController7.setHasRunSave(true);
        };

        return BattleSceneController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/attack-system.ts", ['cc', './math.ts', './squad-battle-config.ts'], function (exports) {
  'use strict';

  var cclegacy, distance, SQUAD_UNIT_STATS;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
    }, function (module) {
      SQUAD_UNIT_STATS = module.SQUAD_UNIT_STATS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "b5794oJtq5Bf6JKPF4rZxop", "attack-system", undefined);

      var AttackSystem = exports('AttackSystem', /*#__PURE__*/function () {
        function AttackSystem() {}

        var _proto = AttackSystem.prototype;

        _proto.attackIfPossible = function attackIfPossible(attacker, target) {
          if (!attacker.alive || !target.alive) return {
            attacked: false,
            killed: false
          };
          var cfg = SQUAD_UNIT_STATS[attacker.unitId];
          var scaledDamage = cfg.attackDamage * (1 + (attacker.star - 1) * 0.8);
          if (scaledDamage <= 0) return {
            attacked: false,
            killed: false
          };
          if (attacker.attackCooldownLeft > 0) return {
            attacked: false,
            killed: false
          };
          var dist = distance(attacker.position, target.position);
          if (dist > cfg.attackRange) return {
            attacked: false,
            killed: false
          };
          target.currentHp = Math.max(0, target.currentHp - scaledDamage);
          target.alive = target.currentHp > 0;
          attacker.attackCooldownLeft = cfg.attackInterval;
          return {
            attacked: true,
            killed: !target.alive
          };
        };

        return AttackSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/unit-command-system.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _extends, _defineProperty;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _extends = module.extends;
      _defineProperty = module.defineProperty;
    }],
    execute: function () {
      cclegacy._RF.push({}, "b8560zr1TRE2J0+ECaz5cIS", "unit-command-system", undefined);

      var UnitCommandSystem = exports('UnitCommandSystem', /*#__PURE__*/function () {
        function UnitCommandSystem() {
          _defineProperty(this, "selectedUnitId", void 0);
        }

        var _proto = UnitCommandSystem.prototype;

        _proto.selectUnit = function selectUnit(unitId, allies) {
          var exists = allies.some(function (ally) {
            return ally.instanceId === unitId && ally.alive;
          });
          if (!exists) return false;
          this.selectedUnitId = unitId;
          return true;
        };

        _proto.clearSelection = function clearSelection() {
          this.selectedUnitId = undefined;
        };

        _proto.getSelectedUnitId = function getSelectedUnitId() {
          return this.selectedUnitId;
        };

        _proto.issueMoveToGround = function issueMoveToGround(position, allies) {
          var unit = this.getSelectedAlly(allies);
          if (!unit) return false;
          unit.command = {
            type: 'move',
            position: _extends({}, position)
          };
          return true;
        };

        _proto.issueFocusEnemy = function issueFocusEnemy(enemyId, allies) {
          var unit = this.getSelectedAlly(allies);
          if (!unit) return false;
          unit.command = {
            type: 'focus_enemy',
            targetEnemyId: enemyId
          };
          return true;
        };

        _proto.issueChannelHealAlly = function issueChannelHealAlly(targetAllyId, allies) {
          var unit = this.getSelectedAlly(allies);
          if (!unit || unit.role !== 'priest') return false;
          unit.command = {
            type: 'channel_heal',
            targetAllyId: targetAllyId
          };
          return true;
        };

        _proto.getSelectedAlly = function getSelectedAlly(allies) {
          var _this = this;

          if (!this.selectedUnitId) return undefined;
          return allies.find(function (ally) {
            return ally.instanceId === _this.selectedUnitId && ally.alive;
          });
        };

        return UnitCommandSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main-menu-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Sprite, Color, Node, Vec3, Button, Label, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, _extends;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Color = module.Color;
      Node = module.Node;
      Vec3 = module.Vec3;
      Button = module.Button;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _extends = module.extends;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "bf0e3VUQ4pA+qwlTgC92zdD", "main-menu-controller", undefined);

      var ccclass = _decorator.ccclass;
      var MainMenuController = exports('MainMenuController', (_dec = ccclass('MainMenuController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(MainMenuController, _Component);

        function MainMenuController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "onStart", void 0);

          _defineProperty(_assertThisInitialized(_this), "onLoadRequested", void 0);

          _defineProperty(_assertThisInitialized(_this), "onSettingAdjusted", void 0);

          _defineProperty(_assertThisInitialized(_this), "panelNode", null);

          _defineProperty(_assertThisInitialized(_this), "panelTitleLabel", null);

          _defineProperty(_assertThisInitialized(_this), "panelBodyLabel", null);

          _defineProperty(_assertThisInitialized(_this), "footerLabel", null);

          _defineProperty(_assertThisInitialized(_this), "panelContentNode", null);

          _defineProperty(_assertThisInitialized(_this), "activePanel", null);

          _defineProperty(_assertThisInitialized(_this), "settings", {
            master: 80,
            music: 70,
            sfx: 80
          });

          _defineProperty(_assertThisInitialized(_this), "achievements", {
            firstClear: false
          });

          _defineProperty(_assertThisInitialized(_this), "hasRunSave", false);

          return _this;
        }

        var _proto = MainMenuController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone,
              _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(960, 640);
          var bg = this.node.addComponent(Sprite);
          bg.color = new Color(8, 15, 28, 255);
          this.makeStripe('TopGlow', 0, 210, 760, 140, new Color(20, 184, 166, 72));
          this.makeStripe('BottomGlow', 0, -180, 900, 180, new Color(245, 158, 11, 48));
          this.makeLabel('Title', '神塔战棋', 0, 168, 760, 36, new Color(248, 250, 252, 255));
          this.makeLabel('Subtitle', '2D 小队实时指挥战斗原型', 0, 124, 640, 16, new Color(148, 163, 184, 255));
          this.makeLabel('Tagline', '先从主菜单进入，再进入准备阶段和实时指挥战斗。', 0, 88, 640, 14, new Color(191, 219, 254, 255));
          this.makeMenuButton('StartButton', '开始', 0, 12, new Color(21, 128, 61, 255), function () {
            var _this2$onStart;

            return (_this2$onStart = _this2.onStart) === null || _this2$onStart === void 0 ? void 0 : _this2$onStart.call(_this2);
          });
          this.makeMenuButton('LoadButton', '载入', 0, -54, new Color(37, 99, 235, 255), function () {
            var _this2$onLoadRequeste;

            return (_this2$onLoadRequeste = _this2.onLoadRequested) === null || _this2$onLoadRequeste === void 0 ? void 0 : _this2$onLoadRequeste.call(_this2);
          });
          this.makeMenuButton('SettingsButton', '设置', 0, -120, new Color(71, 85, 105, 255), function () {
            return _this2.showPanel('settings');
          });
          this.makeMenuButton('CreditsButton', '鸣谢', 0, -186, new Color(120, 53, 15, 255), function () {
            return _this2.showPanel('credits');
          });
          this.makePanelButton(this.node, 'AchievementsButton', '成就', 332, 246, 120, 40, new Color(76, 29, 149, 255), function () {
            return _this2.showPanel('achievements');
          });
          this.footerLabel = this.makeLabel('Footer', '当前版本：可玩原型，主循环已接通。', 0, -276, 720, 13, new Color(226, 232, 240, 255));
          this.createPanel();
          this.syncLoadButtonState();
        };

        _proto.setFooterText = function setFooterText(text) {
          if (this.footerLabel) {
            this.footerLabel.string = text;
          }
        };

        _proto.setSettings = function setSettings(settings) {
          this.settings = _extends({}, settings);

          if (this.activePanel === 'settings') {
            this.renderSettingsPanel();
          }
        };

        _proto.setAchievements = function setAchievements(achievements) {
          this.achievements = _extends({}, achievements);

          if (this.activePanel === 'achievements') {
            this.renderAchievementsPanel();
          }
        };

        _proto.setHasRunSave = function setHasRunSave(hasSave) {
          this.hasRunSave = hasSave;
          this.syncLoadButtonState();
        };

        _proto.showPanel = function showPanel(panel) {
          if (!this.panelNode || !this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
          this.activePanel = panel;
          this.panelNode.active = true;
          this.panelContentNode.removeAllChildren();

          if (panel === 'settings') {
            this.renderSettingsPanel();
            return;
          }

          if (panel === 'achievements') {
            this.renderAchievementsPanel();
            return;
          }

          this.panelTitleLabel.string = '鸣谢';
          this.panelBodyLabel.string = '项目方向：Battleheart 风格 2D 小队实时指挥。\n\n玩法原型、系统拆分与菜单/战斗串联由当前工程主线驱动完成。';
          this.makePanelBodyNote('CreditsNote', '当前版本优先保证可玩性、存档与交互链路成立，美术仍以占位资源为主。', 0, -10, 420, new Color(191, 219, 254, 255));
        };

        _proto.hidePanel = function hidePanel() {
          this.activePanel = null;

          if (this.panelNode) {
            this.panelNode.active = false;
          }
        };

        _proto.renderSettingsPanel = function renderSettingsPanel() {
          if (!this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
          this.panelTitleLabel.string = '设置';
          this.panelBodyLabel.string = '音量调整会直接保存到本地配置。当前原型尚未接入正式 BGM / SFX，但数值会持久化。';
          this.makeSettingRow('Master', '总音量', 'master', this.settings.master, 56);
          this.makeSettingRow('Music', '音乐', 'music', this.settings.music, 6);
          this.makeSettingRow('Sfx', '音效', 'sfx', this.settings.sfx, -44);
        };

        _proto.renderAchievementsPanel = function renderAchievementsPanel() {
          if (!this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
          this.panelTitleLabel.string = '成就';
          this.panelBodyLabel.string = '当前仅接入一个基础成就，用于确认单关通关链路。';
          var unlocked = this.achievements.firstClear;
          var row = new Node('AchievementRow');
          row.layer = Layers.Enum.UI_2D;
          this.panelContentNode.addChild(row);
          row.setPosition(new Vec3(0, 18, 0));
          row.addComponent(UITransform).setContentSize(420, 64);
          var bg = row.addComponent(Sprite);
          bg.color = unlocked ? new Color(21, 128, 61, 255) : new Color(51, 65, 85, 255);
          var title = this.makeInlineLabel(row, 'AchTitle', -190, 12, 360, 16, new Color(248, 250, 252, 255));
          title.string = '初次通关';
          var desc = this.makeInlineLabel(row, 'AchDesc', -190, -12, 360, 12, new Color(226, 232, 240, 255));
          desc.string = unlocked ? '已解锁：完成当前唯一关卡并进入 victory。' : '未解锁：完成当前唯一关卡并进入 victory。';
          var badge = this.makeInlineLabel(row, 'AchBadge', 132, 0, 120, 14, new Color(253, 224, 71, 255));
          badge.string = unlocked ? '已解锁' : '未解锁';
        };

        _proto.makeSettingRow = function makeSettingRow(name, labelText, key, value, y) {
          var _this3 = this;

          if (!this.panelContentNode) return;
          var row = new Node(name + "Row");
          row.layer = Layers.Enum.UI_2D;
          this.panelContentNode.addChild(row);
          row.setPosition(new Vec3(0, y, 0));
          row.addComponent(UITransform).setContentSize(420, 40);
          var label = this.makeInlineLabel(row, name + "Label", -190, 0, 120, 14, new Color(248, 250, 252, 255));
          label.string = labelText;
          var valueLabel = this.makeInlineLabel(row, name + "Value", 0, 0, 80, 14, new Color(251, 191, 36, 255));
          valueLabel.string = value + "%";
          this.makePanelButton(row, name + "Minus", '-', 110, 0, 34, 28, new Color(30, 41, 59, 255), function () {
            return _this3.adjustSetting(key, -10);
          });
          this.makePanelButton(row, name + "Plus", '+', 156, 0, 34, 28, new Color(30, 41, 59, 255), function () {
            return _this3.adjustSetting(key, 10);
          });
        };

        _proto.adjustSetting = function adjustSetting(key, delta) {
          var _this$onSettingAdjust;

          var nextValue = Math.max(0, Math.min(100, this.settings[key] + delta));
          (_this$onSettingAdjust = this.onSettingAdjusted) === null || _this$onSettingAdjust === void 0 ? void 0 : _this$onSettingAdjust.call(this, key, nextValue);
        };

        _proto.syncLoadButtonState = function syncLoadButtonState() {
          if (!this.footerLabel) return;
          this.footerLabel.string = this.hasRunSave ? '当前版本：检测到本地存档，可直接载入继续。' : this.footerLabel.string;
        };

        _proto.createPanel = function createPanel() {
          var _this4 = this;

          this.panelNode = new Node('MenuPanel');
          this.panelNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(this.panelNode);
          this.panelNode.addComponent(UITransform).setContentSize(520, 340);
          this.panelNode.setPosition(new Vec3(0, -8, 0));
          var bg = this.panelNode.addComponent(Sprite);
          bg.color = new Color(15, 23, 42, 242);
          this.panelNode.active = false;
          this.panelTitleLabel = this.makePanelLabel(this.panelNode, 'PanelTitle', -220, 132, 440, 24, new Color(251, 191, 36, 255));
          this.panelBodyLabel = this.makePanelLabel(this.panelNode, 'PanelBody', -220, 84, 440, 72, new Color(226, 232, 240, 255));

          if (this.panelBodyLabel) {
            this.panelBodyLabel.lineHeight = 20;
          }

          this.panelContentNode = new Node('PanelContent');
          this.panelContentNode.layer = Layers.Enum.UI_2D;
          this.panelNode.addChild(this.panelContentNode);
          this.panelContentNode.setPosition(new Vec3(0, -10, 0));
          this.panelContentNode.addComponent(UITransform).setContentSize(440, 150);
          this.makePanelButton(this.panelNode, 'ClosePanel', '关闭', 0, -136, 136, 40, new Color(30, 41, 59, 255), function () {
            return _this4.hidePanel();
          });
        };

        _proto.makeStripe = function makeStripe(name, x, y, width, height, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, height);
          var sprite = node.addComponent(Sprite);
          sprite.color = color;
        };

        _proto.makeMenuButton = function makeMenuButton(name, text, x, y, color, onClick) {
          this.makePanelButton(this.node, name, text, x, y, 240, 48, color, onClick);
        };

        _proto.makePanelButton = function makePanelButton(parent, name, text, x, y, width, height, color, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          parent.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, height);
          var sprite = node.addComponent(Sprite);
          sprite.color = color;
          node.addComponent(Button);
          node.on(Button.EventType.CLICK, onClick, this);
          var labelNode = new Node(name + "Label");
          labelNode.layer = Layers.Enum.UI_2D;
          node.addChild(labelNode);
          labelNode.addComponent(UITransform).setContentSize(width - 12, height - 8);
          var label = labelNode.addComponent(Label);
          label.string = text;
          label.fontSize = 18;
          label.lineHeight = 22;
          label.color = new Color(248, 250, 252, 255);
        };

        _proto.makeLabel = function makeLabel(name, text, x, y, width, fontSize, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, fontSize + 14);
          var label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 8;
          label.color = color;
          return label;
        };

        _proto.makePanelLabel = function makePanelLabel(parent, name, x, y, width, fontSize, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          parent.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, 120);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 6;
          label.color = color;
          return label;
        };

        _proto.makeInlineLabel = function makeInlineLabel(parent, name, x, y, width, fontSize, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          parent.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, fontSize + 10);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 4;
          label.color = color;
          return label;
        };

        _proto.makePanelBodyNote = function makePanelBodyNote(name, text, x, y, width, color) {
          if (!this.panelContentNode) return;
          var label = this.makeInlineLabel(this.panelContentNode, name, x, y, width, 13, color);
          label.string = text;
          label.lineHeight = 20;
        };

        return MainMenuController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/id.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _createForOfIteratorHelperLoose;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }],
    execute: function () {
      exports({
        nextId: nextId,
        syncIdSeedFromIds: syncIdSeedFromIds
      });

      cclegacy._RF.push({}, "cf91dmKjNlCwZeqk4O0iNzw", "id", undefined);

      var idSeed = 1;

      function nextId(prefix) {
        var id = prefix + "_" + idSeed;
        idSeed += 1;
        return id;
      }

      function syncIdSeedFromIds(ids) {
        var maxSeed = 0;

        for (var _iterator = _createForOfIteratorHelperLoose(ids), _step; !(_step = _iterator()).done;) {
          var id = _step.value;
          var match = /_(\d+)$/.exec(id);
          if (!match) continue;
          var value = Number(match[1]);

          if (Number.isFinite(value) && value > maxSeed) {
            maxSeed = value;
          }
        }

        idSeed = Math.max(idSeed, maxSeed + 1);
      }

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/sprite-resolvers.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './art-resource-manifest.ts', './unit-star-sprite-config.ts'], function (exports) {
  'use strict';

  var cclegacy, resources, ImageAsset, SpriteFrame, _asyncToGenerator, _createForOfIteratorHelperLoose, ART_RESOURCE_MANIFEST, UNIT_STAR_SPRITE_BASE_FALLBACK, UNIT_STAR_SPRITE_PATHS;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      ImageAsset = module.ImageAsset;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      ART_RESOURCE_MANIFEST = module.ART_RESOURCE_MANIFEST;
    }, function (module) {
      UNIT_STAR_SPRITE_BASE_FALLBACK = module.UNIT_STAR_SPRITE_BASE_FALLBACK;
      UNIT_STAR_SPRITE_PATHS = module.UNIT_STAR_SPRITE_PATHS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d0658afYLdL748YYFKlOAjd", "sprite-resolvers", undefined);

      var loadedFrames = new Map();
      var loadedFrameSets = new Map();

      var asResourcePath = function asResourcePath(rawPath) {
        if (rawPath.startsWith('assets/resources/')) {
          return rawPath.replace(/^assets\/resources\//, '').replace(/\.(png|jpg|jpeg)$/i, '');
        }

        if (rawPath.startsWith('assets/art/backgrounds/')) {
          var _rawPath$split$pop;

          var file = (_rawPath$split$pop = rawPath.split('/').pop()) === null || _rawPath$split$pop === void 0 ? void 0 : _rawPath$split$pop.replace(/\.(png|jpg|jpeg)$/i, '');
          return file ? "textures/backgrounds/" + file : null;
        }

        return null;
      };

      var loadFrame = function loadFrame(manifestPath) {
        if (!manifestPath) return Promise.resolve(null);
        var cacheKey = manifestPath;
        var cached = loadedFrames.get(cacheKey);
        if (cached) return cached;
        var resourcePath = asResourcePath(manifestPath);
        if (!resourcePath) return Promise.resolve(null);
        var pending = new Promise(function (resolve) {
          resources.load(resourcePath, ImageAsset, function (err, asset) {
            if (err || !asset) {
              resolve(null);
              return;
            }

            resolve(SpriteFrame.createWithImage(asset));
          });
        });
        loadedFrames.set(cacheKey, pending);
        return pending;
      };

      var loadFrameFromResourcePath = function loadFrameFromResourcePath(resourcePath) {
        if (!resourcePath) return Promise.resolve(null);
        var cacheKey = "resource:" + resourcePath;
        var cached = loadedFrames.get(cacheKey);
        if (cached) return cached;
        var pending = new Promise(function (resolve) {
          resources.load(resourcePath, ImageAsset, function (err, asset) {
            if (err || !asset) {
              resolve(null);
              return;
            }

            resolve(SpriteFrame.createWithImage(asset));
          });
        });
        loadedFrames.set(cacheKey, pending);
        return pending;
      };

      var loadFrameSet = function loadFrameSet(manifestPaths) {
        var cacheKey = "set:" + manifestPaths.join('|');
        var cached = loadedFrameSets.get(cacheKey);
        if (cached) return cached;
        var pending = Promise.all(manifestPaths.map(function (path) {
          return loadFrame(path);
        })).then(function (frames) {
          return frames.filter(function (frame) {
            return Boolean(frame);
          });
        });
        loadedFrameSets.set(cacheKey, pending);
        return pending;
      };

      var loadFirstFrameSet = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(candidateSets) {
          var _iterator, _step, paths, frames;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _iterator = _createForOfIteratorHelperLoose(candidateSets);

                case 1:
                  if ((_step = _iterator()).done) {
                    _context.next = 10;
                    break;
                  }

                  paths = _step.value;
                  _context.next = 5;
                  return loadFrameSet(paths);

                case 5:
                  frames = _context.sent;

                  if (!(frames.length > 0)) {
                    _context.next = 8;
                    break;
                  }

                  return _context.abrupt("return", frames);

                case 8:
                  _context.next = 1;
                  break;

                case 10:
                  return _context.abrupt("return", []);

                case 11:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function loadFirstFrameSet(_x) {
          return _ref.apply(this, arguments);
        };
      }();

      var UnitSpriteResolver = exports('UnitSpriteResolver', /*#__PURE__*/function () {
        function UnitSpriteResolver() {}

        var _proto = UnitSpriteResolver.prototype;

        _proto.resolve = /*#__PURE__*/function () {
          var _resolve = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(unitId, star, divineState) {
            var _entry$divineOverride, _entry$stars, _entry$stars$star, _entry$stars2, _UNIT_STAR_SPRITE_PAT;

            var entry, filename, path, primary, starFallback, starFrame;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    entry = ART_RESOURCE_MANIFEST.units[unitId];

                    if (entry) {
                      _context2.next = 3;
                      break;
                    }

                    return _context2.abrupt("return", null);

                  case 3:
                    filename = divineState ? (_entry$divineOverride = entry.divineOverride) !== null && _entry$divineOverride !== void 0 ? _entry$divineOverride : (_entry$stars = entry.stars) === null || _entry$stars === void 0 ? void 0 : _entry$stars[star] : (_entry$stars$star = (_entry$stars2 = entry.stars) === null || _entry$stars2 === void 0 ? void 0 : _entry$stars2[star]) !== null && _entry$stars$star !== void 0 ? _entry$stars$star : entry.divineOverride;
                    path = filename ? entry.directory + "/" + filename : undefined;
                    _context2.next = 7;
                    return loadFrame(path);

                  case 7:
                    primary = _context2.sent;

                    if (!primary) {
                      _context2.next = 10;
                      break;
                    }

                    return _context2.abrupt("return", primary);

                  case 10:
                    starFallback = (_UNIT_STAR_SPRITE_PAT = UNIT_STAR_SPRITE_PATHS[unitId]) === null || _UNIT_STAR_SPRITE_PAT === void 0 ? void 0 : _UNIT_STAR_SPRITE_PAT[star];
                    _context2.next = 13;
                    return loadFrameFromResourcePath(starFallback);

                  case 13:
                    starFrame = _context2.sent;

                    if (!starFrame) {
                      _context2.next = 16;
                      break;
                    }

                    return _context2.abrupt("return", starFrame);

                  case 16:
                    return _context2.abrupt("return", loadFrameFromResourcePath(UNIT_STAR_SPRITE_BASE_FALLBACK[unitId]));

                  case 17:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          function resolve(_x2, _x3, _x4) {
            return _resolve.apply(this, arguments);
          }

          return resolve;
        }();

        _proto.resolvePortrait = /*#__PURE__*/function () {
          var _resolvePortrait = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(unitId, star, divineState) {
            var entry, portraitPath, portraitFrame;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    entry = ART_RESOURCE_MANIFEST.units[unitId];

                    if (entry) {
                      _context3.next = 3;
                      break;
                    }

                    return _context3.abrupt("return", this.resolve(unitId, star, divineState));

                  case 3:
                    portraitPath = entry.portrait ? entry.directory + "/" + entry.portrait : undefined;
                    _context3.next = 6;
                    return loadFrame(portraitPath);

                  case 6:
                    portraitFrame = _context3.sent;

                    if (!portraitFrame) {
                      _context3.next = 9;
                      break;
                    }

                    return _context3.abrupt("return", portraitFrame);

                  case 9:
                    return _context3.abrupt("return", this.resolve(unitId, star, divineState));

                  case 10:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          function resolvePortrait(_x5, _x6, _x7) {
            return _resolvePortrait.apply(this, arguments);
          }

          return resolvePortrait;
        }();

        _proto.resolveAvatar = /*#__PURE__*/function () {
          var _resolveAvatar = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(unitId) {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    return _context4.abrupt("return", loadFrameFromResourcePath(UNIT_STAR_SPRITE_BASE_FALLBACK[unitId]));

                  case 1:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }));

          function resolveAvatar(_x8) {
            return _resolveAvatar.apply(this, arguments);
          }

          return resolveAvatar;
        }();

        _proto.resolveAnimation = /*#__PURE__*/function () {
          var _resolveAnimation = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(unitId, clip, divineState) {
            var entry, baseId, clipNames, candidates;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    entry = ART_RESOURCE_MANIFEST.units[unitId];

                    if (entry) {
                      _context5.next = 3;
                      break;
                    }

                    return _context5.abrupt("return", []);

                  case 3:
                    baseId = divineState ? unitId : unitId;
                    clipNames = [clip];
                    candidates = clipNames.map(function (clipName) {
                      return Array.from({
                        length: 5
                      }, function (_, index) {
                        return entry.directory + "/" + baseId + "_" + clipName + "_" + String(index + 1).padStart(2, '0') + ".png";
                      });
                    });
                    return _context5.abrupt("return", loadFirstFrameSet(candidates));

                  case 7:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          function resolveAnimation(_x9, _x10, _x11) {
            return _resolveAnimation.apply(this, arguments);
          }

          return resolveAnimation;
        }();

        return UnitSpriteResolver;
      }());
      var EnemySpriteResolver = exports('EnemySpriteResolver', /*#__PURE__*/function () {
        function EnemySpriteResolver() {}

        var _proto2 = EnemySpriteResolver.prototype;

        _proto2.resolve = /*#__PURE__*/function () {
          var _resolve2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(enemyType) {
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    return _context6.abrupt("return", loadFrame(ART_RESOURCE_MANIFEST.enemies[enemyType]));

                  case 1:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6);
          }));

          function resolve(_x12) {
            return _resolve2.apply(this, arguments);
          }

          return resolve;
        }();

        _proto2.resolveAnimation = /*#__PURE__*/function () {
          var _resolveAnimation2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(enemyType, clip) {
            var staticPath, directory, frames;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    staticPath = ART_RESOURCE_MANIFEST.enemies[enemyType];
                    directory = staticPath.split('/').slice(0, -1).join('/');
                    frames = Array.from({
                      length: 5
                    }, function (_, index) {
                      return directory + "/" + enemyType + "_" + clip + "_" + String(index + 1).padStart(2, '0') + ".png";
                    });
                    return _context7.abrupt("return", loadFrameSet(frames));

                  case 4:
                  case "end":
                    return _context7.stop();
                }
              }
            }, _callee7);
          }));

          function resolveAnimation(_x13, _x14) {
            return _resolveAnimation2.apply(this, arguments);
          }

          return resolveAnimation;
        }();

        return EnemySpriteResolver;
      }());
      var UiIconResolver = exports('UiIconResolver', /*#__PURE__*/function () {
        function UiIconResolver() {}

        var _proto3 = UiIconResolver.prototype;

        _proto3.resolve = /*#__PURE__*/function () {
          var _resolve3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(iconId) {
            var found;
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    found = ART_RESOURCE_MANIFEST.uiIcons.find(function (path) {
                      return path.endsWith("/" + iconId + ".png");
                    });
                    return _context8.abrupt("return", loadFrame(found));

                  case 2:
                  case "end":
                    return _context8.stop();
                }
              }
            }, _callee8);
          }));

          function resolve(_x15) {
            return _resolve3.apply(this, arguments);
          }

          return resolve;
        }();

        return UiIconResolver;
      }());
      var BackgroundResolver = exports('BackgroundResolver', /*#__PURE__*/function () {
        function BackgroundResolver() {}

        var _proto4 = BackgroundResolver.prototype;

        _proto4.resolve = /*#__PURE__*/function () {
          var _resolve4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(sceneId) {
            var found;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    found = ART_RESOURCE_MANIFEST.backgrounds.find(function (path) {
                      return path.includes(sceneId);
                    });
                    return _context9.abrupt("return", loadFrame(found));

                  case 2:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9);
          }));

          function resolve(_x16) {
            return _resolve4.apply(this, arguments);
          }

          return resolve;
        }();

        return BackgroundResolver;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/enemy-ai-system.ts", ['cc', './math.ts', './_rollupPluginModLoBabelHelpers.js', './squad-battle-config.ts'], function (exports) {
  'use strict';

  var cclegacy, distance, normalize, _createForOfIteratorHelperLoose, ENEMY_STATS;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
      normalize = module.normalize;
    }, function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      ENEMY_STATS = module.ENEMY_STATS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d0982lWdNlPnKxSN+Y2aMKj", "enemy-ai-system", undefined);

      var EnemyAiSystem = exports('EnemyAiSystem', /*#__PURE__*/function () {
        function EnemyAiSystem() {}

        var _proto = EnemyAiSystem.prototype;

        _proto.tick = function tick(enemies, allies, dt) {
          for (var _iterator = _createForOfIteratorHelperLoose(enemies), _step; !(_step = _iterator()).done;) {
            var enemy = _step.value;
            if (!enemy.alive) continue;
            enemy.attackCooldownLeft = Math.max(0, enemy.attackCooldownLeft - dt);
            var target = this.pickNearestAliveAlly(enemy, allies);

            if (!target) {
              enemy.velocity.x = 0;
              enemy.velocity.y = 0;
              continue;
            }

            var cfg = ENEMY_STATS[enemy.enemyType];
            var dist = distance(enemy.position, target.position);

            if (dist <= cfg.attackRange) {
              enemy.velocity.x = 0;
              enemy.velocity.y = 0;

              if (enemy.attackCooldownLeft <= 0) {
                target.currentHp = Math.max(0, target.currentHp - cfg.attackDamage);
                target.alive = target.currentHp > 0;
                enemy.attackCooldownLeft = cfg.attackInterval;
              }
            } else {
              var dir = normalize(enemy.position, target.position);
              enemy.velocity.x = dir.x * cfg.moveSpeed;
              enemy.velocity.y = dir.y * cfg.moveSpeed;
              enemy.position.x += enemy.velocity.x * dt;
              enemy.position.y += enemy.velocity.y * dt;
            }
          }
        };

        _proto.pickNearestAliveAlly = function pickNearestAliveAlly(enemy, allies) {
          var _allies$filter$map$so;

          return (_allies$filter$map$so = allies.filter(function (ally) {
            return ally.alive;
          }).map(function (ally) {
            return {
              ally: ally,
              dist: distance(enemy.position, ally.position)
            };
          }).sort(function (a, b) {
            return a.dist - b.dist;
          })[0]) === null || _allies$filter$map$so === void 0 ? void 0 : _allies$filter$map$so.ally;
        };

        return EnemyAiSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/squad-battle-ui.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './battle-scene-controller.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, _inheritsLoose, BattleSceneController;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      BattleSceneController = module.BattleSceneController;
    }],
    execute: function () {
      var _dec, _class;

      cclegacy._RF.push({}, "d0d41OBFvZGHId9SGlyc1i4", "squad-battle-ui", undefined);

      var ccclass = _decorator.ccclass;
      var SquadBattleUi = exports('SquadBattleUi', (_dec = ccclass('SquadBattleUi'), _dec(_class = /*#__PURE__*/function (_BattleSceneControlle) {
        _inheritsLoose(SquadBattleUi, _BattleSceneControlle);

        function SquadBattleUi() {
          return _BattleSceneControlle.apply(this, arguments) || this;
        }

        return SquadBattleUi;
      }(BattleSceneController)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/wave-transition-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Vec3, Tween, tween, Component, _inheritsLoose, _defineProperty, _assertThisInitialized;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Vec3 = module.Vec3;
      Tween = module.Tween;
      tween = module.tween;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "d6bc69DMFZOKomYgljOKNnB", "wave-transition-controller", undefined);

      var ccclass = _decorator.ccclass;
      var WaveTransitionController = exports('WaveTransitionController', (_dec = ccclass('WaveTransitionController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WaveTransitionController, _Component);

        function WaveTransitionController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "prepPanelNode", null);

          _defineProperty(_assertThisInitialized(_this), "battlefieldNode", null);

          _defineProperty(_assertThisInitialized(_this), "prevPrepState", null);

          return _this;
        }

        var _proto = WaveTransitionController.prototype;

        _proto.bind = function bind(prepPanelNode, battlefieldNode) {
          this.prepPanelNode = prepPanelNode;
          this.battlefieldNode = battlefieldNode;
        };

        _proto.sync = function sync(snapshot) {
          if (!this.prepPanelNode || !this.battlefieldNode) return;
          var prepState = snapshot.uiState.prepPanel;

          if (prepState !== this.prevPrepState) {
            this.prevPrepState = prepState;

            if (prepState === 'visible' || prepState === 'rising') {
              this.prepPanelNode.active = true;
              this.tweenPrepTo(new Vec3(0, -120, 0));
            } else if (prepState === 'falling') {
              this.prepPanelNode.active = true;
              this.tweenPrepTo(new Vec3(0, -420, 0));
            } else {
              this.prepPanelNode.active = false;
              this.prepPanelNode.setPosition(new Vec3(0, -420, 0));
            }
          }
        };

        _proto.tweenPrepTo = function tweenPrepTo(target) {
          if (!this.prepPanelNode) return;
          Tween.stopAllByTarget(this.prepPanelNode);
          tween(this.prepPanelNode).to(0.35, {
            position: target
          }).start();
        };

        return WaveTransitionController;
      }(Component), _temp)) || _class));

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
          refreshCost: 2
        },
        normal: {
          id: 'normal',
          name: '普通',
          totalWaves: 30,
          startingGold: 20,
          refreshCost: 2
        },
        hard: {
          id: 'hard',
          name: '困难',
          totalWaves: 60,
          startingGold: 24,
          refreshCost: 3
        }
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/unit-star-sprite-config.ts", ['cc'], function (exports) {
  'use strict';

  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "defe7VdSmFMPI2MJoKP6VfQ", "unit-star-sprite-config", undefined);

      var makeDefaultStarPaths = function makeDefaultStarPaths(unitId) {
        return {
          1: "textures/avatars/" + unitId + "/star1",
          2: "textures/avatars/" + unitId + "/star2",
          3: "textures/avatars/" + unitId + "/star3"
        };
      };

      var UNIT_STAR_SPRITE_PATHS = exports('UNIT_STAR_SPRITE_PATHS', {
        archer: makeDefaultStarPaths('archer'),
        shield_guard: makeDefaultStarPaths('shield_guard'),
        warrior: makeDefaultStarPaths('warrior'),
        mage: makeDefaultStarPaths('mage'),
        priest: makeDefaultStarPaths('priest'),
        cavalry: makeDefaultStarPaths('cavalry'),
        spearman: makeDefaultStarPaths('spearman'),
        berserker: makeDefaultStarPaths('berserker'),
        light_mage: makeDefaultStarPaths('light_mage')
      });
      var UNIT_STAR_SPRITE_BASE_FALLBACK = exports('UNIT_STAR_SPRITE_BASE_FALLBACK', {
        archer: 'textures/avatars/archer',
        shield_guard: 'textures/avatars/shield_guard',
        warrior: 'textures/avatars/warrior',
        mage: 'textures/avatars/mage',
        priest: 'textures/avatars/priest',
        cavalry: 'textures/avatars/cavalry',
        spearman: 'textures/avatars/spearman',
        berserker: 'textures/avatars/berserker',
        light_mage: 'textures/avatars/light_mage'
      });

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/targeting-system.ts", ['cc', './math.ts'], function (exports) {
  'use strict';

  var cclegacy, distance;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      distance = module.distance;
    }],
    execute: function () {
      cclegacy._RF.push({}, "e5833C8HO1Fqo9sMIPElqVU", "targeting-system", undefined);

      var TargetingSystem = exports('TargetingSystem', /*#__PURE__*/function () {
        function TargetingSystem() {}

        var _proto = TargetingSystem.prototype;

        _proto.findNearestEnemyInRange = function findNearestEnemyInRange(unit, enemies, range) {
          var _enemies$filter$map$f;

          return (_enemies$filter$map$f = enemies.filter(function (enemy) {
            return enemy.alive;
          }).map(function (enemy) {
            return {
              enemy: enemy,
              dist: distance(unit.position, enemy.position)
            };
          }).filter(function (entry) {
            return entry.dist <= range;
          }).sort(function (a, b) {
            return a.dist - b.dist;
          })[0]) === null || _enemies$filter$map$f === void 0 ? void 0 : _enemies$filter$map$f.enemy;
        };

        _proto.findEnemyById = function findEnemyById(enemyId, enemies) {
          return enemies.find(function (enemy) {
            return enemy.instanceId === enemyId && enemy.alive;
          });
        };

        _proto.findAllyById = function findAllyById(allyId, allies) {
          return allies.find(function (ally) {
            return ally.instanceId === allyId && ally.alive;
          });
        };

        return TargetingSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/character-select-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './unit-config.ts', './sprite-resolvers.ts'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Sprite, Color, Node, Vec3, Button, Label, Component, _inheritsLoose, _defineProperty, _assertThisInitialized, _asyncToGenerator, UNIT_CONFIG, UnitSpriteResolver;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Color = module.Color;
      Node = module.Node;
      Vec3 = module.Vec3;
      Button = module.Button;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
    }, function (module) {
      UNIT_CONFIG = module.UNIT_CONFIG;
    }, function (module) {
      UnitSpriteResolver = module.UnitSpriteResolver;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "eb2d5Q5pitJnYnnrR0u4gH2", "character-select-controller", undefined);

      var ccclass = _decorator.ccclass;
      var PREVIEW_MAX_WIDTH = 220;
      var PREVIEW_MAX_HEIGHT = 240;
      var PORTRAIT_ASPECT = {
        warrior: 2 / 3
      };
      var CharacterSelectController = exports('CharacterSelectController', (_dec = ccclass('CharacterSelectController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CharacterSelectController, _Component);

        function CharacterSelectController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "onBack", void 0);

          _defineProperty(_assertThisInitialized(_this), "onConfirm", void 0);

          _defineProperty(_assertThisInitialized(_this), "resolver", new UnitSpriteResolver());

          _defineProperty(_assertThisInitialized(_this), "options", []);

          _defineProperty(_assertThisInitialized(_this), "selectedIndex", 0);

          _defineProperty(_assertThisInitialized(_this), "previewSprite", null);

          _defineProperty(_assertThisInitialized(_this), "previewTransform", null);

          _defineProperty(_assertThisInitialized(_this), "titleLabel", null);

          _defineProperty(_assertThisInitialized(_this), "detailLabel", null);

          _defineProperty(_assertThisInitialized(_this), "footerLabel", null);

          return _this;
        }

        var _proto = CharacterSelectController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone,
              _this2 = this;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(960, 640);
          var bg = this.node.addComponent(Sprite);
          bg.color = new Color(9, 18, 32, 255);
          this.makePanel('Backdrop', 0, 0, 820, 560, new Color(15, 23, 42, 245));
          this.makeLabel('PageTitle', '选择初始职业', 0, 228, 520, 28, new Color(248, 250, 252, 255));
          this.makeLabel('PageHint', '左右切换你想带入第一回合的队长职业，确认后会作为起始棋子进入备战区。', 0, 194, 660, 14, new Color(191, 219, 254, 255));
          var preview = new Node('Preview');
          preview.layer = Layers.Enum.UI_2D;
          this.node.addChild(preview);
          preview.setPosition(new Vec3(0, 34, 0));
          this.previewTransform = preview.addComponent(UITransform);
          this.previewTransform.setContentSize(PREVIEW_MAX_WIDTH, PREVIEW_MAX_HEIGHT);
          this.previewSprite = preview.addComponent(Sprite);
          this.previewSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          this.previewSprite.color = new Color(148, 163, 184, 255);
          this.titleLabel = this.makeLabel('SelectedTitle', '', 0, -126, 520, 24, new Color(251, 191, 36, 255));
          this.detailLabel = this.makeLabel('SelectedDetail', '', 0, -168, 620, 14, new Color(226, 232, 240, 255));
          if (this.detailLabel) this.detailLabel.lineHeight = 20;
          this.footerLabel = this.makeLabel('Footer', '左右切换职业，右下角开始游戏。', 0, -230, 620, 13, new Color(148, 163, 184, 255));
          this.makeButton('Prev', '◀', -224, 24, 56, 56, new Color(30, 41, 59, 255), function () {
            return _this2.shiftSelection(-1);
          });
          this.makeButton('Next', '▶', 224, 24, 56, 56, new Color(30, 41, 59, 255), function () {
            return _this2.shiftSelection(1);
          });
          this.makeButton('Back', '返回', -278, -248, 140, 42, new Color(71, 85, 105, 255), function () {
            var _this2$onBack;

            return (_this2$onBack = _this2.onBack) === null || _this2$onBack === void 0 ? void 0 : _this2$onBack.call(_this2);
          });
          this.makeButton('Confirm', '开始游戏', 280, -248, 160, 42, new Color(21, 128, 61, 255), function () {
            return _this2.confirmSelection();
          });
        };

        _proto.setOptions = function setOptions(options, selectedUnitId) {
          this.options = [].concat(options);
          var foundIndex = selectedUnitId ? this.options.indexOf(selectedUnitId) : -1;
          this.selectedIndex = foundIndex >= 0 ? foundIndex : 0;
          void this.renderSelection();
        };

        _proto.shiftSelection = function shiftSelection(delta) {
          if (this.options.length === 0) return;
          this.selectedIndex = (this.selectedIndex + delta + this.options.length) % this.options.length;
          void this.renderSelection();
        };

        _proto.confirmSelection = function confirmSelection() {
          var _this$onConfirm;

          var unitId = this.options[this.selectedIndex];
          if (!unitId) return;
          (_this$onConfirm = this.onConfirm) === null || _this$onConfirm === void 0 ? void 0 : _this$onConfirm.call(this, unitId);
        };

        _proto.renderSelection = /*#__PURE__*/function () {
          var _renderSelection = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var unitId, cfg, frame;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    unitId = this.options[this.selectedIndex];

                    if (unitId) {
                      _context.next = 3;
                      break;
                    }

                    return _context.abrupt("return");

                  case 3:
                    cfg = UNIT_CONFIG[unitId];

                    if (this.titleLabel) {
                      this.titleLabel.string = cfg.name + " \xB7 " + unitId;
                    }

                    if (this.detailLabel) {
                      this.detailLabel.string = "\u804C\u4E1A\u5B9A\u4F4D\uFF1A" + cfg.behaviorRole + "  |  \u751F\u547D " + cfg.maxHp + "  |  \u653B\u51FB " + cfg.baseDamage + "  |  \u79FB\u901F " + cfg.moveSpeed + "\n\u8BE5\u5355\u4F4D\u4F1A\u4F5C\u4E3A\u4F60\u7684\u8D77\u59CB\u961F\u957F\u5B9E\u4F8B\u8FDB\u5165\u7B2C\u4E00\u56DE\u5408\u51C6\u5907\u9636\u6BB5\u3002";
                    }

                    if (this.footerLabel) {
                      this.footerLabel.string = "\u5F53\u524D\u9009\u62E9\uFF1A" + cfg.name + "\u3002\u8FDB\u5165\u6E38\u620F\u540E\u5B83\u4F1A\u4EE5\u6807\u51C6\u68CB\u5B50\u8EAB\u4EFD\u8FDB\u5165\u5907\u6218\u533A\u3002";
                    }

                    if (!this.previewSprite) {
                      _context.next = 14;
                      break;
                    }

                    _context.next = 10;
                    return this.resolver.resolvePortrait(unitId, 1, false);

                  case 10:
                    frame = _context.sent;
                    this.resizePreview(unitId);
                    this.previewSprite.spriteFrame = frame;
                    this.previewSprite.color = frame ? new Color(255, 255, 255, 255) : new Color(148, 163, 184, 255);

                  case 14:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function renderSelection() {
            return _renderSelection.apply(this, arguments);
          }

          return renderSelection;
        }();

        _proto.resizePreview = function resizePreview(unitId) {
          var _PORTRAIT_ASPECT$unit;

          if (!this.previewTransform) return;
          var aspect = (_PORTRAIT_ASPECT$unit = PORTRAIT_ASPECT[unitId]) !== null && _PORTRAIT_ASPECT$unit !== void 0 ? _PORTRAIT_ASPECT$unit : 1;
          var widthByHeight = PREVIEW_MAX_HEIGHT * aspect;

          if (widthByHeight <= PREVIEW_MAX_WIDTH) {
            this.previewTransform.setContentSize(widthByHeight, PREVIEW_MAX_HEIGHT);
            return;
          }

          this.previewTransform.setContentSize(PREVIEW_MAX_WIDTH, PREVIEW_MAX_WIDTH / aspect);
        };

        _proto.makePanel = function makePanel(name, x, y, width, height, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, height);
          var sprite = node.addComponent(Sprite);
          sprite.color = color;
        };

        _proto.makeButton = function makeButton(name, text, x, y, width, height, color, onClick) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, height);
          var sprite = node.addComponent(Sprite);
          sprite.color = color;
          node.addComponent(Button);
          node.on(Button.EventType.CLICK, onClick, this);
          var labelNode = new Node(name + "Label");
          labelNode.layer = Layers.Enum.UI_2D;
          node.addChild(labelNode);
          labelNode.addComponent(UITransform).setContentSize(width - 10, height - 8);
          var label = labelNode.addComponent(Label);
          label.string = text;
          label.fontSize = 18;
          label.lineHeight = 22;
          label.color = new Color(248, 250, 252, 255);
        };

        _proto.makeLabel = function makeLabel(name, text, x, y, width, fontSize, color) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          this.node.addChild(node);
          node.setPosition(new Vec3(x, y, 0));
          node.addComponent(UITransform).setContentSize(width, fontSize + 16);
          var label = node.addComponent(Label);
          label.string = text;
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 6;
          label.color = color;
          return label;
        };

        return CharacterSelectController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/roster-system.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './squad-ui-layout-config.ts', './id.ts'], function (exports) {
  'use strict';

  var cclegacy, _extends, _defineProperty, SQUAD_BENCH_SLOTS, SQUAD_DEPLOY_SLOTS, nextId;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _extends = module.extends;
      _defineProperty = module.defineProperty;
    }, function (module) {
      SQUAD_BENCH_SLOTS = module.SQUAD_BENCH_SLOTS;
      SQUAD_DEPLOY_SLOTS = module.SQUAD_DEPLOY_SLOTS;
    }, function (module) {
      nextId = module.nextId;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ecb73zLkzhLTYh6DV74fKHq", "roster-system", undefined);

      var RosterSystem = exports('RosterSystem', /*#__PURE__*/function () {
        function RosterSystem() {
          _defineProperty(this, "bench", []);

          _defineProperty(this, "deployed", []);
        }

        var _proto = RosterSystem.prototype;

        _proto.reset = function reset() {
          this.bench = [];
          this.deployed = [];
        };

        _proto.setState = function setState(bench, deployed) {
          this.bench = bench.map(function (u) {
            return _extends({}, u);
          });
          this.deployed = deployed.map(function (u) {
            return _extends({}, u);
          });
        };

        _proto.addToBench = function addToBench(unitId) {
          return this.addToBenchWithState({
            unitId: unitId,
            star: 1
          });
        };

        _proto.addToBenchWithState = function addToBenchWithState(template) {
          var _template$instanceId;

          if (this.bench.length >= SQUAD_BENCH_SLOTS) {
            return null;
          }

          var instance = {
            instanceId: (_template$instanceId = template.instanceId) !== null && _template$instanceId !== void 0 ? _template$instanceId : nextId('roster_unit'),
            unitId: template.unitId,
            star: template.star,
            assignedTaskId: template.assignedTaskId,
            isCaptain: template.isCaptain
          };
          this.bench.push(instance);
          this.tryMerge(template.unitId, 1);
          return instance;
        };

        _proto.deploy = function deploy(instanceId) {
          if (this.deployed.length >= SQUAD_DEPLOY_SLOTS) return false;
          var unit = this.bench.find(function (u) {
            return u.instanceId === instanceId;
          });
          if (!unit) return false;
          this.bench = this.bench.filter(function (u) {
            return u.instanceId !== instanceId;
          });
          this.deployed.push(unit);
          return true;
        };

        _proto.recall = function recall(instanceId) {
          var unit = this.deployed.find(function (u) {
            return u.instanceId === instanceId;
          });
          if (!unit) return false;
          this.deployed = this.deployed.filter(function (u) {
            return u.instanceId !== instanceId;
          });
          this.bench.push(unit);
          return true;
        };

        _proto.removeUnit = function removeUnit(instanceId) {
          var inBench = this.bench.some(function (u) {
            return u.instanceId === instanceId;
          });

          if (inBench) {
            this.bench = this.bench.filter(function (u) {
              return u.instanceId !== instanceId;
            });
            return true;
          }

          var inDeployed = this.deployed.some(function (u) {
            return u.instanceId === instanceId;
          });

          if (inDeployed) {
            this.deployed = this.deployed.filter(function (u) {
              return u.instanceId !== instanceId;
            });
            return true;
          }

          return false;
        };

        _proto.assignTask = function assignTask(instanceId, taskId) {
          var unit = this.findByInstanceId(instanceId);

          if (unit) {
            unit.assignedTaskId = taskId;
          }
        };

        _proto.evolveUnit = function evolveUnit(instanceId, targetUnitId) {
          var unit = this.findByInstanceId(instanceId);
          if (!unit) return;
          unit.unitId = targetUnitId;
          unit.star = 3;
          unit.assignedTaskId = undefined;
        };

        _proto.getBench = function getBench() {
          return this.bench.map(function (u) {
            return _extends({}, u);
          });
        };

        _proto.getDeployed = function getDeployed() {
          return this.deployed.map(function (u) {
            return _extends({}, u);
          });
        };

        _proto.getDeployCount = function getDeployCount() {
          return this.deployed.length;
        };

        _proto.getAllUnits = function getAllUnits() {
          return [].concat(this.bench, this.deployed).map(function (u) {
            return _extends({}, u);
          });
        };

        _proto.getDeployUnitsForBattle = function getDeployUnitsForBattle() {
          return this.deployed.slice(0, SQUAD_DEPLOY_SLOTS).map(function (u) {
            return _extends({}, u);
          });
        };

        _proto.findByInstanceId = function findByInstanceId(instanceId) {
          return [].concat(this.bench, this.deployed).find(function (u) {
            return u.instanceId === instanceId;
          });
        };

        _proto.tryMerge = function tryMerge(unitId, star) {
          var candidates = this.getMergeCandidates(unitId, star);
          if (candidates.length < 3) return;
          var selected = candidates.slice(0, 3);
          var keep = selected[0];
          var consumedIds = selected.slice(1).map(function (c) {
            return c.unit.instanceId;
          });
          this.bench = this.bench.filter(function (u) {
            return !consumedIds.includes(u.instanceId);
          });
          this.deployed = this.deployed.filter(function (u) {
            return !consumedIds.includes(u.instanceId);
          });
          keep.unit.star = star + 1;

          if (star === 1) {
            this.tryMerge(unitId, 2);
          }
        };

        _proto.getMergeCandidates = function getMergeCandidates(unitId, star) {
          var fromBench = this.bench.filter(function (u) {
            return u.unitId === unitId && u.star === star && !u.assignedTaskId;
          }).map(function (unit) {
            return {
              source: 'bench',
              unit: unit
            };
          });
          var fromDeployed = this.deployed.filter(function (u) {
            return u.unitId === unitId && u.star === star && !u.assignedTaskId;
          }).map(function (unit) {
            return {
              source: 'deployed',
              unit: unit
            };
          });
          return [].concat(fromDeployed, fromBench);
        };

        return RosterSystem;
      }());

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/shop-system.ts", ['cc', './_rollupPluginModLoBabelHelpers.js', './unit-config.ts', './random.ts', './squad-ui-layout-config.ts'], function (exports) {
  'use strict';

  var cclegacy, _defineProperty, SHOP_UNIT_POOL, pickN, SQUAD_SHOP_SLOTS;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      _defineProperty = module.defineProperty;
    }, function (module) {
      SHOP_UNIT_POOL = module.SHOP_UNIT_POOL;
    }, function (module) {
      pickN = module.pickN;
    }, function (module) {
      SQUAD_SHOP_SLOTS = module.SQUAD_SHOP_SLOTS;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ee9f9o+pp5DxKm5XCeOMkjm", "shop-system", undefined);

      var ShopSystem = exports('ShopSystem', /*#__PURE__*/function () {
        function ShopSystem() {
          _defineProperty(this, "entries", []);
        }

        var _proto = ShopSystem.prototype;

        _proto.refresh = function refresh() {
          this.entries = pickN(SHOP_UNIT_POOL, SQUAD_SHOP_SLOTS);
          return [].concat(this.entries);
        };

        _proto.getEntries = function getEntries() {
          return [].concat(this.entries);
        };

        _proto.setEntries = function setEntries(entries) {
          this.entries = [].concat(entries);
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

System.register("chunks:///_virtual/command-overlay-controller.ts", ['cc', './_rollupPluginModLoBabelHelpers.js'], function (exports) {
  'use strict';

  var cclegacy, _decorator, Layers, UITransform, Node, Vec3, Label, Color, Component, _inheritsLoose, _defineProperty, _assertThisInitialized;

  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Node = module.Node;
      Vec3 = module.Vec3;
      Label = module.Label;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      _inheritsLoose = module.inheritsLoose;
      _defineProperty = module.defineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }],
    execute: function () {
      var _dec, _class, _temp;

      cclegacy._RF.push({}, "fae77DTys1J5bx7Hawlm+dF", "command-overlay-controller", undefined);

      var ccclass = _decorator.ccclass;
      var CommandOverlayController = exports('CommandOverlayController', (_dec = ccclass('CommandOverlayController'), _dec(_class = (_temp = /*#__PURE__*/function (_Component) {
        _inheritsLoose(CommandOverlayController, _Component);

        function CommandOverlayController() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _defineProperty(_assertThisInitialized(_this), "noticeLabel", null);

          return _this;
        }

        var _proto = CommandOverlayController.prototype;

        _proto.initialize = function initialize() {
          var _this$node$getCompone;

          this.node.layer = Layers.Enum.UI_2D;
          var transform = (_this$node$getCompone = this.node.getComponent(UITransform)) !== null && _this$node$getCompone !== void 0 ? _this$node$getCompone : this.node.addComponent(UITransform);
          transform.setContentSize(920, 40);
          var labelNode = new Node('CommandNotice');
          labelNode.layer = Layers.Enum.UI_2D;
          this.node.addChild(labelNode);
          labelNode.setPosition(new Vec3(-430, 0, 0));
          labelNode.addComponent(UITransform).setContentSize(860, 30);
          this.noticeLabel = labelNode.addComponent(Label);
          this.noticeLabel.fontSize = 12;
          this.noticeLabel.color = new Color(134, 239, 172, 255);
        };

        _proto.setNotice = function setNotice(text) {
          if (this.noticeLabel) this.noticeLabel.string = text;
        };

        return CommandOverlayController;
      }(Component), _temp)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./math.ts', './squad-battle-config.ts', './collision-system.ts', './art-resource-manifest.ts', './divine-task-config.ts', './unit-config.ts', './random.ts', './divine-task-system.ts', './types.ts', './unit-star-sprite-config.ts', './sprite-resolvers.ts', './battle-hud-controller.ts', './difficulty-config.ts', './economy-system.ts', './squad-ui-layout-config.ts', './shop-system.ts', './id.ts', './attack-system.ts', './enemy-ai-system.ts', './healing-system.ts', './movement-system.ts', './roster-system.ts', './targeting-system.ts', './unit-command-system.ts', './squad-battle-session.ts', './unit-view.ts', './enemy-view.ts', './local-profile-storage.ts', './prep-panel-controller.ts', './battlefield-controller.ts', './types2.ts', './character-select-controller.ts', './command-overlay-controller.ts', './main-menu-controller.ts', './wave-transition-controller.ts', './battle-scene-controller.ts', './squad-battle-ui.ts'], function () {
  'use strict';

  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
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
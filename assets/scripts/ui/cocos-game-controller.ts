import { _decorator, Button, Camera, Canvas, Color, Component, director, Graphics, ImageAsset, Label, Layers, Node, resources, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { DIFFICULTY_CONFIG } from '../config/difficulty-config';
import { DIVINE_TASK_CONFIG } from '../config/divine-task-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { GameController } from '../core/game-controller';
import { DifficultyId, UnitId } from '../models/types';

const { ccclass, property } = _decorator;

@ccclass('CocosGameController')
export class CocosGameController extends Component {
  @property(SpriteFrame)
  public boardSprite: SpriteFrame | null = null;

  @property(SpriteFrame)
  public tileSprite: SpriteFrame | null = null;

  @property(SpriteFrame)
  public unitSprite: SpriteFrame | null = null;

  @property(SpriteFrame)
  public enemySprite: SpriteFrame | null = null;

  @property(SpriteFrame)
  public crystalSprite: SpriteFrame | null = null;

  private readonly controller = new GameController();
  private uiRoot: Node | null = null;
  private statusLabel: Label | null = null;
  private cocosBoardRoot: Node | null = null;
  private cocosBenchRoot: Node | null = null;
  private domRoot: HTMLDivElement | null = null;
  private domBoard: HTMLDivElement | null = null;
  private domStatus: HTMLPreElement | null = null;
  private htmlDebugVisible = false;
  private selectedUnitInstanceId: string | null = null;
  private selectedUnitSource: 'bench' | 'placed' | null = null;
  private currentScreen: 'home' | 'map' | 'settings' | 'credits' | 'game' = 'home';
  private pendingDifficulty: DifficultyId = 'beginner';
  private volume = 80;
  private avatarPulseTime = 0;
  private readonly unitAvatarSprites: Partial<Record<UnitId, SpriteFrame>> = {};
  private speed = 1;

  public onLoad(): void {
    console.log('[CocosGameController] onLoad');
    this.ensureRuntimeCanvas();
    this.showHomeScreen();
    this.loadDefaultSprites();
  }

  public onDestroy(): void {
    this.removeBrowserOverlay();
  }

  public startBeginner(): void {
    this.startGame('beginner');
  }

  public startNormal(): void {
    this.startGame('normal');
  }

  public startHard(): void {
    this.startGame('hard');
  }

  public startGame(difficulty: DifficultyId): void {
    this.selectedUnitInstanceId = null;
    this.selectedUnitSource = null;
    this.currentScreen = 'game';
    this.buildRuntimeUi();
    this.controller.startGame(difficulty);
    this.refreshStatus(`开始${DIFFICULTY_CONFIG[difficulty].name}难度`);
  }

  public refreshShop(): void {
    this.logAndRefresh('刷新商店', this.controller.refreshShop());
  }

  public buySlot0(): void {
    this.buy(0);
  }

  public buySlot1(): void {
    this.buy(1);
  }

  public buySlot2(): void {
    this.buy(2);
  }

  public buy(slotIndex: number): void {
    this.logAndRefresh(`购买商店${slotIndex + 1}`, this.controller.buy(slotIndex));
  }

  public buyAll(): void {
    let bought = 0;
    for (let i = 0; i < 3; i += 1) {
      if (this.controller.buy(0)) {
        bought += 1;
      }
    }
    this.refreshStatus(`自动购买${bought}个棋子`);
  }

  public place(instanceId: string, lane: number, tileIndex: number): void {
    this.logAndRefresh(`上阵${instanceId}`, this.controller.place(instanceId, lane, tileIndex));
  }

  public movePlaced(instanceId: string, lane: number, tileIndex: number): void {
    this.logAndRefresh(`移动${instanceId}`, this.controller.movePlaced(instanceId, lane, tileIndex));
  }

  public autoPlaceBench(): void {
    const snapshot = this.controller.snapshot();
    let placedCount = 0;

    for (const unit of snapshot.bench) {
      const position = this.findFirstOpenTile();
      if (!position) {
        break;
      }
      if (this.controller.place(unit.instanceId, position.lane, position.tileIndex)) {
        placedCount += 1;
      }
    }

    this.refreshStatus(`自动上阵${placedCount}个棋子`);
  }

  public moveFirstPlaced(): void {
    const snapshot = this.controller.snapshot();
    const first = snapshot.placed[0];
    if (!first) {
      this.refreshStatus('没有可移动的上阵棋子');
      return;
    }

    const position = this.findFirstOpenTile(first.instanceId);
    if (!position) {
      this.refreshStatus('没有空位可移动');
      return;
    }

    this.logAndRefresh(`移动${first.instanceId}`, this.controller.movePlaced(first.instanceId, position.lane, position.tileIndex));
  }

  public beginBattle(): void {
    this.selectedUnitInstanceId = null;
    this.selectedUnitSource = null;
    this.logAndRefresh('开始战斗', this.controller.beginBattle());
  }

  public toggleSpeed(): void {
    this.speed = this.speed === 1 ? 3 : 1;
    this.refreshStatus(`速度 x${this.speed}`);
  }

  public toggleHtmlDebug(): void {
    this.htmlDebugVisible = !this.htmlDebugVisible;
    if (this.htmlDebugVisible) {
      this.buildBrowserOverlay();
    } else {
      this.removeBrowserOverlay();
    }
    this.refreshStatus(`HTML调试面板${this.htmlDebugVisible ? '开启' : '关闭'}`);
  }

  public update(dt: number): void {
    if (this.currentScreen !== 'game') {
      return;
    }
    this.avatarPulseTime += dt;
    this.controller.tick(dt * this.speed);
    this.refreshStatus();
  }

  public snapshot() {
    return this.controller.snapshot();
  }

  private loadDefaultSprites(): void {
    if (!this.boardSprite) {
      this.loadSpriteIfEmpty('textures/board', (spriteFrame) => {
        this.boardSprite = spriteFrame;
      });
    }
    if (!this.tileSprite) {
      this.loadSpriteIfEmpty('textures/tile', (spriteFrame) => {
        this.tileSprite = spriteFrame;
      });
    }
    if (!this.unitSprite) {
      this.loadSpriteIfEmpty('textures/unit', (spriteFrame) => {
        this.unitSprite = spriteFrame;
      });
    }
    if (!this.enemySprite) {
      this.loadSpriteIfEmpty('textures/enemy', (spriteFrame) => {
        this.enemySprite = spriteFrame;
      });
    }
    if (!this.crystalSprite) {
      this.loadSpriteIfEmpty('textures/crystal', (spriteFrame) => {
        this.crystalSprite = spriteFrame;
      });
    }
    this.loadDefaultUnitAvatars();
  }

  private loadDefaultUnitAvatars(): void {
    const avatarPaths: Record<UnitId, string> = {
      archer: 'textures/avatars/archer',
      paladin: 'textures/avatars/paladin',
      shield_guard: 'textures/avatars/shield_guard',
      warrior: 'textures/avatars/warrior',
      mage: 'textures/avatars/mage',
      priest: 'textures/avatars/priest',
      cavalry: 'textures/avatars/cavalry',
      spearman: 'textures/avatars/spearman',
      berserker: 'textures/avatars/berserker',
      light_mage: 'textures/avatars/light_mage',
    };

    (Object.keys(avatarPaths) as UnitId[]).forEach((unitId) => {
      this.loadSpriteIfEmpty(avatarPaths[unitId], (spriteFrame) => {
        this.unitAvatarSprites[unitId] = spriteFrame;
      });
    });
  }

  private loadSpriteIfEmpty(path: string, apply: (spriteFrame: SpriteFrame) => void): void {
    resources.load(path, ImageAsset, (imageErr, imageAsset) => {
      if (!imageErr && imageAsset) {
        apply(SpriteFrame.createWithImage(imageAsset));
        this.refreshStatus(`默认贴图已加载: ${path}`);
        return;
      }

      resources.load(path, SpriteFrame, (spriteErr, spriteFrame) => {
        if (!spriteErr && spriteFrame) {
          apply(spriteFrame);
          this.refreshStatus(`默认贴图已加载: ${path}`);
          return;
        }

        resources.load(`${path}/spriteFrame`, SpriteFrame, (fallbackErr, fallbackSpriteFrame) => {
          if (fallbackErr || !fallbackSpriteFrame) {
            console.warn(`[CocosGameController] 贴图加载失败: ${path}`, imageErr ?? spriteErr ?? fallbackErr);
            this.refreshStatus(`默认贴图加载失败: ${path}`);
            return;
          }
          apply(fallbackSpriteFrame);
          this.refreshStatus(`默认贴图已加载: ${path}/spriteFrame`);
        });
      });
    });
  }

  private resetRuntimeRoot(): Node {
    if (this.uiRoot && (this.uiRoot as unknown as { name?: string }).name === 'RuntimeUiRoot') {
      this.uiRoot.removeAllChildren();
      this.statusLabel = null;
      this.cocosBoardRoot = null;
      this.cocosBenchRoot = null;
      return this.uiRoot;
    }

    const parent = this.uiRoot ?? this.node;
    const root = new Node('RuntimeUiRoot');
    root.layer = Layers.Enum.UI_2D;
    parent.addChild(root);
    root.setPosition(new Vec3(0, 0, 0));
    const rootTransform = root.addComponent(UITransform);
    rootTransform.setContentSize(960, 540);
    this.uiRoot = root;
    return root;
  }

  private showHomeScreen(): void {
    this.currentScreen = 'home';
    const root = this.resetRuntimeRoot();
    this.createBackground();
    this.createCocosTextInRoot(root, 'Title', '神塔棋兵', 0, 120, 520, 42, new Color(24, 47, 79, 255));
    this.createCocosTextInRoot(root, 'Subtitle', '守住水晶，合成棋子，完成神品进阶', 0, 76, 520, 16, new Color(71, 85, 105, 255));
    this.createButton('开始', 0, 18, 150, () => this.showMapSelectScreen());
    this.createButton('设置', 0, -30, 150, () => this.showSettingsScreen());
    this.createButton('鸣谢', 0, -78, 150, () => this.showCreditsScreen());
  }

  private showMapSelectScreen(): void {
    this.currentScreen = 'map';
    const root = this.resetRuntimeRoot();
    this.createBackground();
    this.createButton('返回', -420, 245, 70, () => this.showHomeScreen());
    this.createCocosTextInRoot(root, 'MapTitle', '选择地图', 0, 210, 360, 26, new Color(24, 47, 79, 255));
    this.createCocosRectInRoot(root, 'MapCard', 0, 50, 520, 230, new Color(215, 226, 236, 255));
    this.createCocosTextInRoot(root, 'MapCardTitle', '当前地图', 0, 115, 240, 24, new Color(17, 24, 39, 255));
    this.createCocosTextInRoot(root, 'MapCardInfo', '双路线水晶防守', 0, 72, 260, 16, new Color(71, 85, 105, 255));
    this.createCocosTextInRoot(root, 'DifficultyTitle', '难度', -220, -98, 100, 16, new Color(30, 41, 59, 255));
    this.createDifficultyButton('新手', 'beginner', -90);
    this.createDifficultyButton('普通', 'normal', 0);
    this.createDifficultyButton('困难', 'hard', 90);
    this.createCocosTextInRoot(root, 'SelectedDifficulty', `当前：${DIFFICULTY_CONFIG[this.pendingDifficulty].name}`, 0, -142, 220, 14, new Color(71, 85, 105, 255));
    this.createButton('✔', 0, -190, 86, () => this.startGame(this.pendingDifficulty));
  }

  private showSettingsScreen(): void {
    this.currentScreen = 'settings';
    const root = this.resetRuntimeRoot();
    this.createBackground();
    this.createButton('返回', -420, 245, 70, () => this.showHomeScreen());
    this.createCocosTextInRoot(root, 'SettingsTitle', '设置', 0, 150, 260, 30, new Color(24, 47, 79, 255));
    this.createCocosTextInRoot(root, 'VolumeLabel', `音量：${this.volume}`, 0, 70, 220, 20, new Color(30, 41, 59, 255));
    this.createButton('-', -70, 10, 60, () => this.adjustVolume(-10));
    this.createButton('+', 70, 10, 60, () => this.adjustVolume(10));
  }

  private showCreditsScreen(): void {
    this.currentScreen = 'credits';
    const root = this.resetRuntimeRoot();
    this.createBackground();
    this.createButton('返回', -420, 245, 70, () => this.showHomeScreen());
    this.createCocosTextInRoot(root, 'CreditsTitle', '鸣谢', 0, 145, 260, 30, new Color(24, 47, 79, 255));
    this.createCocosTextInRoot(root, 'CreditsBody', '原型设计与实现：Divine Tower Chess\n素材：占位贴图\n引擎：Cocos Creator 3.4.0', 0, 55, 420, 18, new Color(30, 41, 59, 255));
  }

  private createDifficultyButton(text: string, difficulty: DifficultyId, x: number): void {
    const previousDifficulty = this.pendingDifficulty;
    const selected = previousDifficulty === difficulty;
    this.createButton(selected ? `${text}*` : text, x, -100, 72, () => {
      this.pendingDifficulty = difficulty;
      this.showMapSelectScreen();
    });
  }

  private adjustVolume(delta: number): void {
    this.volume = Math.max(0, Math.min(100, this.volume + delta));
    this.showSettingsScreen();
  }

  private buildRuntimeUi(): void {
    const root = this.resetRuntimeRoot();

    this.createBackground();

    this.createButton('首页', -430, 250, 62, () => this.showHomeScreen());
    this.createButton('刷新', -360, 250, 66, () => this.refreshShop());
    this.createButton('买1', -290, 250, 56, () => this.buySlot0());
    this.createButton('买2', -230, 250, 56, () => this.buySlot1());
    this.createButton('买3', -170, 250, 56, () => this.buySlot2());
    this.createButton('全买', -105, 250, 62, () => this.buyAll());
    this.createButton('自动上阵', -20, 250, 86, () => this.autoPlaceBench());
    this.createButton('开战', 64, 250, 62, () => this.beginBattle());

    this.createButton('移动首个', -430, 214, 82, () => this.moveFirstPlaced());
    this.createButton('速度', -340, 214, 62, () => this.toggleSpeed());
    this.createButton('HTML调试', -260, 214, 82, () => this.toggleHtmlDebug());

    this.createCocosBoardRoot();
    this.createCocosBenchRoot();

    const statusNode = new Node('Status');
    statusNode.layer = Layers.Enum.UI_2D;
    root.addChild(statusNode);
    statusNode.setPosition(new Vec3(0, -229, 0));
    const transform = statusNode.addComponent(UITransform);
    transform.setContentSize(900, 66);
    const label = statusNode.addComponent(Label);
    label.color = new Color(30, 30, 30, 255);
    label.fontSize = 12;
    label.lineHeight = 14;
    label.string = '';
    this.statusLabel = label;
  }

  private ensureRuntimeCanvas(): void {
    const scene = director.getScene();
    let canvasNode = this.node.getComponent(Canvas) ? this.node : null;

    if (!canvasNode && scene) {
      const existingCanvas = this.findComponentInChildren(scene, Canvas);
      if (existingCanvas) {
        canvasNode = existingCanvas.node;
      }
    }

    if (!canvasNode) {
      canvasNode = new Node('RuntimeCanvas');
      canvasNode.layer = Layers.Enum.UI_2D;
      scene?.addChild(canvasNode);
      canvasNode.addComponent(Canvas);
    }

    let transform = canvasNode.getComponent(UITransform);
    if (!transform) {
      transform = canvasNode.addComponent(UITransform);
    }
    transform.setContentSize(960, 540);
    canvasNode.layer = Layers.Enum.UI_2D;

    const canvas = canvasNode.getComponent(Canvas);
    const camera = this.ensureUiCamera(canvasNode);
    if (canvas && camera) {
      canvas.cameraComponent = camera;
    }

    this.uiRoot = canvasNode;
  }

  private ensureUiCamera(canvasNode: Node): Camera | null {
    const scene = director.getScene();
    if (!scene) {
      return null;
    }

    const canvasCamera = this.findComponentInChildren(canvasNode, Camera);
    if (canvasCamera) {
      canvasCamera.visibility |= Layers.Enum.UI_2D;
      return canvasCamera;
    }

    const cameras = this.findComponentsInChildren(scene, Camera);
    const existingCamera = cameras.find((camera) => (camera.visibility & Layers.Enum.UI_2D) !== 0);
    if (existingCamera) {
      existingCamera.visibility |= Layers.Enum.UI_2D;
      return existingCamera;
    }

    const cameraNode = new Node('RuntimeUICamera');
    canvasNode.addChild(cameraNode);
    cameraNode.setPosition(new Vec3(0, 0, 1000));
    const camera = cameraNode.addComponent(Camera);
    camera.visibility = Layers.Enum.UI_2D;
    camera.orthoHeight = 270;
    return camera;
  }

  private findComponentInChildren<T extends Component>(root: Node, component: new () => T): T | null {
    return this.findComponentsInChildren(root, component)[0] ?? null;
  }

  private findComponentsInChildren<T extends Component>(root: Node, component: new () => T): T[] {
    const found: T[] = [];
    const visit = (node: Node) => {
      const item = node.getComponent(component);
      if (item) {
        found.push(item);
      }
      for (const child of node.children) {
        visit(child);
      }
    };
    visit(root);
    return found;
  }

  private createCocosBoardRoot(): void {
    const board = new Node('CocosBoard');
    board.layer = Layers.Enum.UI_2D;
    (this.uiRoot ?? this.node).addChild(board);
    board.setPosition(new Vec3(0, 45, 0));
    const transform = board.addComponent(UITransform);
    transform.setContentSize(760, 230);
    this.cocosBoardRoot = board;
  }

  private createCocosBenchRoot(): void {
    const bench = new Node('CocosBench');
    bench.layer = Layers.Enum.UI_2D;
    (this.uiRoot ?? this.node).addChild(bench);
    bench.setPosition(new Vec3(0, -128, 0));
    const transform = bench.addComponent(UITransform);
    transform.setContentSize(760, 58);
    this.cocosBenchRoot = bench;
  }

  private buildBrowserOverlay(): void {
    const doc = globalThis.document;
    if (!doc?.body) {
      return;
    }

    this.domRoot?.remove();

    const root = doc.createElement('div');
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

    const title = doc.createElement('div');
    title.textContent = 'Divine Tower Chess 试玩面板';
    title.style.fontWeight = '700';
    title.style.marginBottom = '8px';
    root.appendChild(title);

    const actions = doc.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexWrap = 'wrap';
    actions.style.gap = '6px';
    actions.style.marginBottom = '10px';
    root.appendChild(actions);

    this.addDomButton(actions, '新手', () => this.startBeginner());
    this.addDomButton(actions, '普通', () => this.startNormal());
    this.addDomButton(actions, '困难', () => this.startHard());
    this.addDomButton(actions, '刷新', () => this.refreshShop());
    this.addDomButton(actions, '买1', () => this.buySlot0());
    this.addDomButton(actions, '买2', () => this.buySlot1());
    this.addDomButton(actions, '买3', () => this.buySlot2());
    this.addDomButton(actions, '全买', () => this.buyAll());
    this.addDomButton(actions, '自动上阵', () => this.autoPlaceBench());
    this.addDomButton(actions, '移动首个', () => this.moveFirstPlaced());
    this.addDomButton(actions, '开战', () => this.beginBattle());
    this.addDomButton(actions, '速度', () => this.toggleSpeed());

    const board = doc.createElement('div');
    board.style.position = 'relative';
    board.style.width = '720px';
    board.style.height = '260px';
    board.style.marginBottom = '10px';
    board.style.background = '#d7e2ec';
    board.style.border = '1px solid #8ca0b3';
    board.style.borderRadius = '4px';
    root.appendChild(board);

    const status = doc.createElement('pre');
    status.style.margin = '0';
    status.style.whiteSpace = 'pre-wrap';
    root.appendChild(status);

    doc.body.appendChild(root);
    this.domRoot = root;
    this.domBoard = board;
    this.domStatus = status;
  }

  private removeBrowserOverlay(): void {
    if (this.domRoot?.parentElement) {
      this.domRoot.parentElement.removeChild(this.domRoot);
    }
    this.domRoot = null;
    this.domBoard = null;
    this.domStatus = null;
  }

  private addDomButton(parent: HTMLElement, text: string, onClick: () => void): void {
    const button = globalThis.document.createElement('button');
    button.textContent = text;
    button.style.padding = '6px 10px';
    button.style.border = '1px solid #3a63a8';
    button.style.borderRadius = '4px';
    button.style.background = '#3a63a8';
    button.style.color = '#fff';
    button.style.cursor = 'pointer';
    button.onclick = onClick;
    parent.appendChild(button);
  }

  private createBackground(): void {
    const background = new Node('RuntimeBackground');
    background.layer = Layers.Enum.UI_2D;
    (this.uiRoot ?? this.node).addChild(background);
    background.setPosition(new Vec3(0, 0, 0));
    const transform = background.addComponent(UITransform);
    transform.setContentSize(960, 540);
    const graphics = background.addComponent(Graphics);
    graphics.fillColor = new Color(235, 240, 245, 255);
    graphics.rect(-480, -270, 960, 540);
    graphics.fill();
  }

  private createButton(text: string, x: number, y: number, width: number, onClick: () => void): void {
    const height = 30;
    const node = new Node(text);
    node.layer = Layers.Enum.UI_2D;
    (this.uiRoot ?? this.node).addChild(node);
    node.setPosition(new Vec3(x, y, 0));

    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);

    const graphics = node.addComponent(Graphics);
    graphics.fillColor = new Color(58, 99, 168, 255);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();

    node.addComponent(Button);
    node.on(Button.EventType.CLICK, onClick, this);

    const labelNode = new Node(`${text}Label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 0, 0));
    const labelTransform = labelNode.addComponent(UITransform);
    labelTransform.setContentSize(width, height);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.color = new Color(255, 255, 255, 255);
    label.fontSize = 15;
    label.lineHeight = 18;
  }

  private findFirstOpenTile(ignoreInstanceId?: string): { lane: number; tileIndex: number } | null {
    const placed = this.controller.snapshot().placed;
    for (let lane = 0; lane < 2; lane += 1) {
      for (let tileIndex = 0; tileIndex < 6; tileIndex += 1) {
        const occupied = placed.some((unit) => unit.instanceId !== ignoreInstanceId && unit.lane === lane && unit.tileIndex === tileIndex);
        if (!occupied) {
          return { lane, tileIndex };
        }
      }
    }
    return null;
  }

  private logAndRefresh(action: string, success: boolean): void {
    this.refreshStatus(`${action}${success ? '成功' : '失败'}`);
  }

  private refreshStatus(message = ''): void {
    if (!this.statusLabel) {
      return;
    }

    const snapshot = this.controller.snapshot();
    const shop = snapshot.shop.map((unitId, index) => `${index + 1}.${UNIT_CONFIG[unitId].name}(${UNIT_CONFIG[unitId].cost})`).join('  ') || '空';
    const bench = snapshot.bench.map((unit) => `${UNIT_CONFIG[unit.unitId].name}${unit.star}星${unit.assignedTaskId ? '[任务]' : ''}`).join('  ') || '空';
    const placed = snapshot.placed
      .map((unit) => {
        const maxHp = UNIT_CONFIG[unit.unitId].maxHp;
        return `${UNIT_CONFIG[unit.unitId].name}${unit.star}星 ${Math.ceil(unit.currentHp)}/${maxHp}${
          unit.assignedTaskId ? ' [任务]' : ''
        }`;
      })
      .join('  ') || '空';
    const tasks = snapshot.divineTasks
      .map((task) => {
        const config = DIVINE_TASK_CONFIG[task.taskId];
        return `${config.sourceUnitId}->${config.targetUnitId} ${Math.floor(task.progress)}/${config.requirement}${task.completed ? ' 完成' : ''}`;
      })
      .join('  ') || '空';
    const enemiesByLane = [0, 1]
      .map((lane) => `路线${lane}: ${snapshot.enemies.filter((enemy) => enemy.lane === lane).length}`)
      .join('  ');
    const spriteCount = [this.boardSprite, this.tileSprite, this.unitSprite, this.enemySprite, this.crystalSprite].filter(Boolean).length;
    const benchSummary = snapshot.bench.length > 4 ? `${snapshot.bench.length}个：${snapshot.bench.slice(0, 4).map((unit) => `${UNIT_CONFIG[unit.unitId].name}${unit.star}星`).join('  ')}...` : bench;
    const placedSummary =
      snapshot.placed.length > 4
        ? `${snapshot.placed.length}个：${snapshot.placed
            .slice(0, 4)
            .map((unit) => `${UNIT_CONFIG[unit.unitId].name}${unit.star}星 ${Math.ceil(unit.currentHp)}/${UNIT_CONFIG[unit.unitId].maxHp}`)
            .join('  ')}...`
        : placed;

    this.statusLabel.string = [
      `状态: ${snapshot.phase}  波次: ${snapshot.waveNumber}/${snapshot.totalWaves}  水晶: ${snapshot.crystalHp}  金币: ${snapshot.gold}  速度: x${this.speed}  贴图: ${spriteCount}/5`,
      message ? `提示: ${message}` : '提示: 购买棋子 -> 自动上阵 -> 开战',
      `商店: ${shop}`,
      `备战区: ${benchSummary}  |  上阵区: ${placedSummary}`,
      `敌人: ${enemiesByLane}  |  神品任务: ${tasks}`,
    ].join('\n');

    if (this.domStatus) {
      this.domStatus.textContent = this.statusLabel.string;
    }
    this.renderCocosBoard();
    this.renderCocosBench();
    this.renderDomBoard();
  }

  private selectUnit(instanceId: string, source: 'bench' | 'placed'): void {
    const snapshot = this.controller.snapshot();
    if (snapshot.phase !== 'prep') {
      this.refreshStatus('只能在准备阶段选择和移动棋子');
      return;
    }

    this.selectedUnitInstanceId = instanceId;
    this.selectedUnitSource = source;
    this.refreshStatus(`已选择${instanceId}，点击棋盘空格放置或移动`);
  }

  private handleTileClick(lane: number, tileIndex: number): void {
    const snapshot = this.controller.snapshot();
    const unitOnTile = snapshot.placed.find((unit) => unit.lane === lane && unit.tileIndex === tileIndex);

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

    const success =
      this.selectedUnitSource === 'bench'
        ? this.controller.place(this.selectedUnitInstanceId, lane, tileIndex)
        : this.controller.movePlaced(this.selectedUnitInstanceId, lane, tileIndex);

    const action = this.selectedUnitSource === 'bench' ? '上阵' : '移动';
    if (success) {
      this.selectedUnitInstanceId = null;
      this.selectedUnitSource = null;
    }
    this.refreshStatus(`${action}${success ? '成功' : '失败'}`);
  }

  private renderCocosBoard(): void {
    if (!this.cocosBoardRoot) {
      return;
    }

    const snapshot = this.controller.snapshot();
    this.cocosBoardRoot.removeAllChildren();

    this.createCocosImageOrRect('BoardBackground', 0, 0, 720, 220, new Color(215, 226, 236, 255), this.boardSprite);
    this.createCocosImageOrRect('Crystal', 315, 0, 38, 90, new Color(56, 189, 248, 255), this.crystalSprite);
    this.createCocosText('CrystalLabel', '水晶', 315, 0, 34, 17, new Color(8, 51, 68, 255));

    for (let lane = 0; lane < 2; lane += 1) {
      const y = this.getCocosLaneY(lane);
      this.createCocosRect(`Lane${lane}`, 0, y, 590, 14, new Color(148, 163, 184, 255));
      for (let tileIndex = 0; tileIndex < 6; tileIndex += 1) {
        const pos = this.getCocosTilePosition(lane, tileIndex);
        const isSelectedTarget = Boolean(this.selectedUnitInstanceId);
        const tileClick = () => this.handleTileClick(lane, tileIndex);
        this.createCocosImageOrRect(
          `Tile${lane}-${tileIndex}`,
          pos.x,
          pos.y,
          54,
          54,
          isSelectedTarget ? new Color(222, 247, 236, 180) : new Color(248, 250, 252, 120),
          this.tileSprite,
          tileClick,
        );
        this.createCocosText(`TileLabel${lane}-${tileIndex}`, `${lane}-${tileIndex}`, pos.x, pos.y - 20, 40, 11, new Color(71, 85, 105, 255), tileClick);
      }
    }

    for (const unit of snapshot.placed) {
      const pos = this.getCocosTilePosition(unit.lane, unit.tileIndex);
      const unitClick = () => this.selectUnit(unit.instanceId, 'placed');
      this.createCocosUnitAvatar(this.cocosBoardRoot, `Unit${unit.instanceId}`, unit.unitId, unit.star, pos.x, pos.y + 4, 48, unit.currentHp <= 0, unitClick);
      const selected = this.selectedUnitInstanceId === unit.instanceId;
      this.createCocosText(
        `UnitLabel${unit.instanceId}`,
        `${selected ? '选中 ' : ''}${unit.star}星 ${Math.ceil(unit.currentHp)}`,
        pos.x,
        pos.y - 26,
        46,
        10,
        new Color(17, 24, 39, 255),
        unitClick,
      );
    }

    for (const enemy of snapshot.enemies) {
      this.createCocosImageOrCircle(
        `Enemy${enemy.instanceId}`,
        this.getCocosEnemyX(enemy.distanceOnPath),
        this.getCocosLaneY(enemy.lane),
        18,
        new Color(194, 65, 12, 255),
        this.enemySprite,
      );
    }
  }

  private renderCocosBench(): void {
    if (!this.cocosBenchRoot) {
      return;
    }

    const snapshot = this.controller.snapshot();
    this.cocosBenchRoot.removeAllChildren();
    this.createCocosRectInRoot(this.cocosBenchRoot, 'BenchBackground', 0, 0, 760, 58, new Color(224, 231, 238, 255));
    this.createCocosTextInRoot(this.cocosBenchRoot, 'BenchTitle', '备战区：点棋子再点格子', -285, 19, 180, 12, new Color(30, 41, 59, 255));

    const shown = snapshot.bench.slice(0, 8);
    shown.forEach((unit, index) => {
      const x = -325 + index * 80;
      const selected = this.selectedUnitInstanceId === unit.instanceId;
      const benchClick = () => this.selectUnit(unit.instanceId, 'bench');
      this.createCocosUnitAvatar(this.cocosBenchRoot, `BenchUnit${unit.instanceId}`, unit.unitId, unit.star, x, -4, 34, false, benchClick);
      this.createCocosTextInRoot(
        this.cocosBenchRoot!,
        `BenchUnitLabel${unit.instanceId}`,
        `${selected ? '选中 ' : ''}${unit.star}星${unit.assignedTaskId ? ' 任务' : ''}`,
        x,
        -25,
        62,
        10,
        new Color(17, 24, 39, 255),
        benchClick,
      );
    });

    if (snapshot.bench.length > shown.length) {
      this.createCocosTextInRoot(this.cocosBenchRoot, 'BenchOverflow', `+${snapshot.bench.length - shown.length}`, 355, -8, 36, 12, new Color(100, 116, 139, 255));
    }
  }

  private createCocosUnitAvatar(
    root: Node | null,
    name: string,
    unitId: UnitId,
    star: 1 | 2 | 3,
    x: number,
    y: number,
    size: number,
    defeated: boolean,
    onClick?: () => void,
  ): void {
    if (!root) return;

    const style = this.getUnitAvatarStyle(unitId, star, defeated);
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(size, size);

    const graphics = node.addComponent(Graphics);
    if (style.divine) {
      const glowPulse = 0.5 + Math.sin(this.avatarPulseTime * 6) * 0.5;
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

    const avatarSprite = this.unitAvatarSprites[unitId];
    if (avatarSprite) {
      this.createCocosSpriteInRoot(
        node,
        `${name}IconSprite`,
        0,
        1,
        size * 0.64,
        size * 0.64,
        avatarSprite,
        defeated ? new Color(210, 214, 220, 210) : style.text,
        onClick,
      );
    } else {
      this.createCocosTextInRoot(node, `${name}Icon`, style.icon, 0, 1, size, Math.max(12, Math.floor(size * 0.34)), style.text, onClick);
    }
  }

  private getUnitAvatarStyle(unitId: UnitId, star: 1 | 2 | 3, defeated: boolean): { fill: Color; border: Color; text: Color; icon: string; divine: boolean } {
    const isDivine = UNIT_CONFIG[unitId].isDivine === true;
    const borderByStar = {
      1: new Color(145, 154, 166, 255),
      2: new Color(34, 197, 94, 255),
      3: new Color(147, 51, 234, 255),
    };
    const fillByUnit: Record<UnitId, Color> = {
      archer: new Color(76, 132, 92, 255),
      paladin: new Color(226, 184, 73, 255),
      shield_guard: new Color(75, 101, 132, 255),
      warrior: new Color(171, 73, 62, 255),
      mage: new Color(86, 112, 190, 255),
      priest: new Color(226, 218, 158, 255),
      cavalry: new Color(102, 99, 166, 255),
      spearman: new Color(78, 154, 144, 255),
      berserker: new Color(184, 42, 42, 255),
      light_mage: new Color(247, 226, 132, 255),
    };
    const iconByUnit: Record<UnitId, string> = {
      archer: '弓',
      paladin: '圣',
      shield_guard: '盾',
      warrior: '战',
      mage: '法',
      priest: '牧',
      cavalry: '骑',
      spearman: '枪',
      berserker: '狂',
      light_mage: '光',
    };

    if (defeated) {
      return {
        fill: new Color(120, 126, 136, 255),
        border: new Color(78, 84, 94, 255),
        text: new Color(238, 242, 247, 255),
        icon: iconByUnit[unitId],
        divine: false,
      };
    }

    return {
      fill: fillByUnit[unitId],
      border: isDivine ? new Color(245, 190, 60, 255) : borderByStar[star],
      text: isDivine ? new Color(72, 48, 8, 255) : new Color(248, 250, 252, 255),
      icon: iconByUnit[unitId],
      divine: isDivine,
    };
  }

  private createCocosRect(name: string, x: number, y: number, width: number, height: number, color: Color, onClick?: () => void): void {
    if (!this.cocosBoardRoot) return;
    this.createCocosRectInRoot(this.cocosBoardRoot, name, x, y, width, height, color, onClick);
  }

  private createCocosImageOrRect(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    spriteFrame: SpriteFrame | null,
    onClick?: () => void,
  ): void {
    if (!this.cocosBoardRoot) return;
    this.createCocosImageOrRectInRoot(this.cocosBoardRoot, name, x, y, width, height, color, spriteFrame, onClick);
  }

  private createCocosRectInRoot(root: Node, name: string, x: number, y: number, width: number, height: number, color: Color, onClick?: () => void): void {
    this.createCocosImageOrRectInRoot(root, name, x, y, width, height, color, null, onClick);
  }

  private createCocosImageOrRectInRoot(
    root: Node,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color,
    spriteFrame: SpriteFrame | null,
    onClick?: () => void,
  ): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    if (spriteFrame) {
      const sprite = node.addComponent(Sprite);
      sprite.spriteFrame = spriteFrame;
      sprite.color = new Color(255, 255, 255, 255);
    } else {
      const graphics = node.addComponent(Graphics);
      graphics.fillColor = color;
      graphics.rect(-width / 2, -height / 2, width, height);
      graphics.fill();
    }
    if (onClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, onClick, this);
    }
  }

  private createCocosSpriteInRoot(
    root: Node,
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    spriteFrame: SpriteFrame,
    color: Color,
    onClick?: () => void,
  ): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.spriteFrame = spriteFrame;
    sprite.color = color;
    if (onClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, onClick, this);
    }
  }

  private createCocosImageOrCircle(name: string, x: number, y: number, size: number, color: Color, spriteFrame: SpriteFrame | null): void {
    if (spriteFrame) {
      this.createCocosImageOrRect(name, x, y, size, size, new Color(255, 255, 255, 255), spriteFrame);
      return;
    }
    this.createCocosCircle(name, x, y, size / 2, color);
  }

  private createCocosCircle(name: string, x: number, y: number, radius: number, color: Color): void {
    if (!this.cocosBoardRoot) return;
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.cocosBoardRoot.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(radius * 2, radius * 2);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.circle(0, 0, radius);
    graphics.fill();
  }

  private createCocosText(name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color, onClick?: () => void): void {
    if (!this.cocosBoardRoot) return;
    this.createCocosTextInRoot(this.cocosBoardRoot, name, text, x, y, width, fontSize, color, onClick);
  }

  private createCocosTextInRoot(root: Node, name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color, onClick?: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, Math.max(40, fontSize * 3));
    const label = node.addComponent(Label);
    label.string = text;
    label.color = color;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 2;
    if (onClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, onClick, this);
    }
  }

  private renderDomBoard(): void {
    if (!this.domBoard) {
      return;
    }

    const snapshot = this.controller.snapshot();
    this.domBoard.innerHTML = '';

    this.createDomCrystal();
    for (let lane = 0; lane < 2; lane += 1) {
      this.createDomLane(lane);
      for (let tileIndex = 0; tileIndex < 6; tileIndex += 1) {
        this.createDomTile(lane, tileIndex);
      }
    }

    for (const unit of snapshot.placed) {
      const pos = this.getBoardTilePosition(unit.lane, unit.tileIndex);
      const el = globalThis.document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = `${pos.x - 28}px`;
      el.style.top = `${pos.y - 26}px`;
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
      el.textContent = `${UNIT_CONFIG[unit.unitId].name}\n${unit.star}星\n${Math.ceil(unit.currentHp)}`;
      el.style.whiteSpace = 'pre-line';
      this.domBoard.appendChild(el);
    }

    for (const enemy of snapshot.enemies) {
      const x = this.getEnemyX(enemy.distanceOnPath);
      const y = this.getLaneY(enemy.lane);
      const el = globalThis.document.createElement('div');
      el.style.position = 'absolute';
      el.style.left = `${x - 10}px`;
      el.style.top = `${y - 10}px`;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '10px';
      el.style.background = '#c2410c';
      el.style.border = '2px solid #7c2d12';
      el.title = `${enemy.enemyId} HP ${Math.ceil(enemy.currentHp)}`;
      this.domBoard.appendChild(el);
    }
  }

  private createDomLane(lane: number): void {
    if (!this.domBoard) return;
    const y = this.getLaneY(lane);
    const line = globalThis.document.createElement('div');
    line.style.position = 'absolute';
    line.style.left = '40px';
    line.style.top = `${y - 8}px`;
    line.style.width = '610px';
    line.style.height = '16px';
    line.style.background = '#94a3b8';
    line.style.borderRadius = '8px';
    this.domBoard.appendChild(line);
  }

  private createDomTile(lane: number, tileIndex: number): void {
    if (!this.domBoard) return;
    const pos = this.getBoardTilePosition(lane, tileIndex);
    const tile = globalThis.document.createElement('div');
    tile.style.position = 'absolute';
    tile.style.left = `${pos.x - 32}px`;
    tile.style.top = `${pos.y - 32}px`;
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
    tile.textContent = `${lane}-${tileIndex}`;
    this.domBoard.appendChild(tile);
  }

  private createDomCrystal(): void {
    if (!this.domBoard) return;
    const crystal = globalThis.document.createElement('div');
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
  }

  private getBoardTilePosition(lane: number, tileIndex: number): { x: number; y: number } {
    return {
      x: 90 + tileIndex * 86,
      y: this.getLaneY(lane),
    };
  }

  private getEnemyX(distanceOnPath: number): number {
    return Math.min(650, 45 + distanceOnPath * 39);
  }

  private getLaneY(lane: number): number {
    return lane === 0 ? 85 : 175;
  }

  private getCocosTilePosition(lane: number, tileIndex: number): { x: number; y: number } {
    return {
      x: -270 + tileIndex * 82,
      y: this.getCocosLaneY(lane),
    };
  }

  private getCocosEnemyX(distanceOnPath: number): number {
    return Math.min(290, -315 + distanceOnPath * 39);
  }

  private getCocosLaneY(lane: number): number {
    return lane === 0 ? 36 : -36;
  }
}

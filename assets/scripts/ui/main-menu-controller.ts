import { DifficultyId } from '../models/types';

export class MainMenuController {
  public onSelectDifficulty(cb: (difficulty: DifficultyId) => void, difficulty: DifficultyId): void {
    cb(difficulty);
  }
}

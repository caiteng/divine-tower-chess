# Unit Star Progression Spec

Goal:
Define the visual progression rules for first-pass unit portraits / in-battle placeholder sprites.

Classes:
- warrior
- mage
- priest
- archer
- shield_guard
- cavalry
- spearman

Star progression rules:
- 1-star: poor / damaged / rough beginner equipment
- 2-star: cleaner / stronger / mid-tier equipment
- 3-star: advanced / noble / polished high-tier equipment

Examples:
- warrior:
  - 1-star: torn coarse cloth, poor gear
  - 2-star: worn old armor
  - 3-star: advanced heavy armor
- mage:
  - 1-star: rough linen robe
  - 2-star: clean white robe
  - 3-star: luxurious ornate robe
- priest:
  - similar robe progression to mage, but more holy / healing identity

Usage rules:
- v1 can use portraits, busts, or simplified full-body sprites
- do not introduce 3D pipeline
- keep assets in 2D sprite workflow
- map each unitId + star level to a placeholder sprite asset path

Repository integration (implemented):
- star-specific path map config: `assets/scripts/config/unit-star-sprite-config.ts`
- runtime loading now prefers `unitId + star` sprite path and falls back to unit base avatar path

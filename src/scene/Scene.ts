import { Entity } from "./Entity";
import { Renderer } from "../renderers/Renderer";

export class Scene {
  private entities: Entity[] = [];

  add(entity: Entity): void {
    this.entities.push(entity);
    this.sort();
  }

  remove(entity: Entity): void {
    this.entities = this.entities.filter(e => e !== entity);
  }

  private sort(): void {
    this.entities.sort((a, b) => a.zIndex - b.zIndex);
  }

  update(deltaTime: number): void {
    for (const entity of this.entities) {
      if (entity.active) {
        entity.update(deltaTime);
      }
    }
  }

  render(renderer: Renderer): void {
    for (const entity of this.entities) {
      if (entity.active) {
        entity.render(renderer);
      }
    }
  }

  getEntities(): readonly Entity[] {
    return this.entities;
  }
}

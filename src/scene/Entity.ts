import { Renderer } from "../renderers/Renderer";
import { Transform } from "./Transform";

let ENTITY_ID = 0;

export abstract class Entity {
  readonly id: number;
  readonly transform: Transform;

  zIndex = 0;
  active = true;

  constructor() {
    this.id = ENTITY_ID++;
    this.transform = new Transform();
  }

  update(_deltaTime: number): void {}

  render(_renderer: Renderer): void {}
}

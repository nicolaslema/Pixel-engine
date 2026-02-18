export class Transform {
  x = 0;
  y = 0;
  rotation = 0;
  scaleX = 1;
  scaleY = 1;

  constructor(init?: Partial<Transform>) {
    Object.assign(this, init);
  }
}
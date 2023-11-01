export class WorkNodeActionEntity {
  id: string;
  action_id: string;
  trigger_by_prompt: string;
  constructor() {
    this.id = "";
    this.action_id = "";
    this.trigger_by_prompt = "";
  }
}

export class WorkNodeAttribute {
  name: string;
  title: string;
  constructor() {
    this.name = "";
    this.title = "";
  }
}

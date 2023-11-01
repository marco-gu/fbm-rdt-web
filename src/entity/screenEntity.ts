import { WorkNodeActionEntity, WorkNodeAttribute } from "./workNodeEntity";
export class CommonScreenEntity {
  title: string;
  subtitle: string;
  error_msg: string;
  constructor() {
    this.title = "";
    this.subtitle = "";
    this.error_msg = "";
  }
}

export class ContentMap {
  input: string;
  constructor() {
    this.input = "";
  }
}

export class SingleLineScreenEntity extends CommonScreenEntity {
  prompt: string;
  prompt_after: string;
  input: string;
  content_map: ContentMap;
  work_node_action: WorkNodeActionEntity[];
  constructor() {
    super();
    this.prompt = "";
    this.prompt_after = "";
    this.content_map = new ContentMap();
    this.input = "";
    this.work_node_action = [];
  }
}

export class SummaryScreenEntity {
  title: string;
  subtitle: string;
  prompt: string;
  prompt_after: string;
  error_msg: string;
  input: string;
  constructor() {
    this.title = "";
    this.subtitle = "";
    this.prompt = "";
    this.prompt_after = "";
    this.error_msg = "";
    this.input = "";
  }
}

export class TableInputScreenEntity {
  title: string;
  subtitle: string;
  prompt: string;
  prompt_after: string;
  err_msg: string;
  work_node_attribute_list: WorkNodeAttribute[];
  constructor() {
    this.title = "";
    this.subtitle = "";
    this.prompt = "";
    this.prompt_after = "";
    this.err_msg = "";
    this.work_node_attribute_list = [];
  }
}

export class LoginRequestEntity {
  user_id: string;
  rf_id: string;
  wh_id: string;
  forklift_id: string;
  action_id: string;
  constructor() {
    this.user_id = "";
    this.rf_id = "";
    this.wh_id = "";
    this.forklift_id = "";
    this.action_id = "";
  }
}

export class OptionListEntity {
  title: string;
  subtitle: string;
  prompt: string;
  prompt_after: string;
  err_msg: string;
  work_node_attribute_list: WorkNodeAttribute[];
  constructor() {
    this.title = "";
    this.subtitle = "";
    this.prompt = "";
    this.prompt_after = "";
    this.err_msg = "";
    this.work_node_attribute_list = [];
  }
}

import Vue from "vue";

import ElementUi from "element-ui";
import { Message } from "element-ui";

Vue.use(ElementUi);

Vue.prototype.$message = Message;

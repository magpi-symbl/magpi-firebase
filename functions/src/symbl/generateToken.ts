import * as configs from "../configs/configs";

import {post} from "../utils/requests";
import { SYMBL_AUTHENTICATION_TYPE } from "../constants/constants";

export const generateToken = () => {
    const token_generage_body = {
      type: SYMBL_AUTHENTICATION_TYPE,
      appId: configs.app_id,
      appSecret: configs.app_secret,
    };
  
    return post(configs.token_generate_url, token_generage_body);
  }
'use strict';

const _ = require('lodash');
const quota = require('quota');
const TeamWork = require('node-teamwork');
const bcrypt = require('bcryptjs');

class TeamWorkQuota extends TeamWork {
    constructor(options) {
        super(options);

        if (!_.isString(options.token)) {
            throw new Error('token needs to be a string');
        }

        this.apiKey = bcrypt.hashSync(options.token);
        this.quota = new quota.Client(options.quotaServers);
    }

    async request(options) {
        const grant = await this.quota.requestQuota('teamwork', {
            apiKey: this.apiKey
        }, {
            requests: 1
        });

        try {
            return await super.request(options);
        } finally {
            grant.dismiss();
        }
    }

    dispose() {
        this.quota.dispose();
    }
}

module.exports = TeamWorkQuota;
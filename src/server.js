const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN; //prasath_token

app.listen(process.env.PORT, () => {
  console.log(`webhook is listening: ${process.env.PORT}`);
});

app.get('/heathcheck', (req, res) => {
  res.status(200).send('OK');
});

//to verify the callback url from dashboard side - cloud api side
app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let challange = req.query['hub.challenge'];
  let token = req.query['hub.verify_token'];

  if (mode && token) {
    if (mode === 'subscribe' && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
  res.status(200).send('em method GET');
});

app.post('/webhook', async (req, res) => {
  //i want some

  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));
  // {
  //   messaging_product: 'whatsapp',
  //   to: from,
  //   text: {
  //     body: "Hi.. I'm Prasath, your message is " + msg_body,
  //   },
  // },
  if (body_param.object) {
    console.log('inside body param');
    const failed =
      body_param.entry[0].changes[0].value?.statuses[0]?.status === 'failed';
    if (failed) {
      const contentFaield = body_param.entry[0].changes[0].value?.statuses[0];
      await axios({
        method: 'POST',
        url: env.WEBHOOK_DISCORD,
        data: { content: JSON.stringify(contentFaield) },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log('phone number ' + phon_no_id);
      console.log('from ' + from);
      console.log('boady param ' + msg_body);

      await axios({
        method: 'POST',
        url:
          'https://graph.facebook.com/v13.0/' +
          phon_no_id +
          '/messages?access_token=' +
          token,
        data: {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: from,
          type: 'template',
          template: {
            name: 'auto_msg',
            language: {
              code: 'pt_BR',
            },
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.get('/', (req, res) => {
  res.status(200).send('hello this is webhook setup');
});

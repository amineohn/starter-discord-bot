import {config} from "dotenv";
import express from 'express';
import {InteractionType, InteractionResponseType, verifyKeyMiddleware} from 'discord-interactions';
import axios from "axios";
import {Interaction} from "discord";

config()

const app = express();

const instance = axios.create({
    baseURL: 'https://discord.com/api/',
    timeout: 3000,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Authorization",
        "Authorization": `Bot ${process.env.TOKEN}`
    }
});


app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY!), async (req, res) => {
    const interaction: Interaction = req.body

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        console.log(interaction.data.name)
        if (interaction.data.name == 'yo') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Yo ${interaction.member.user.username}!`,
                },
            });
        }

        if (interaction.data.name == 'dm') {
            // https://discord.com/developers/docs/resources/user#create-dm
            let c = (await instance.post(`/users/@me/channels`, {
                recipient_id: interaction.member.user.id
            })).data
            try {
                // https://discord.com/developers/docs/resources/channel#create-message
                const response = await instance.post(`/channels/${c.id}/messages`, {
                    content: 'Yo! I got your slash command. I am not able to respond to DMs just slash commands.',
                })
                console.log(response.data)
            } catch (e) {
                console.log(e)
            }

            return res.send({
                // https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: '👍'
                }
            });
        }
    }

});


app.get('/register_commands', async (req, res) => {
    const slash_commands = [
        {
            "name": "yo",
            "description": "replies with Yo!",
            "options": []
        },
        {
            "name": "dm",
            "description": "sends user a DM",
            "options": []
        }
    ]
    try {
        // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
        const response = await instance.put(
            `/applications/${process.env.APPLICATION_ID}/guilds/${process.env.GUILD_ID}/commands`,
            slash_commands
        )
        console.log(response.data)
        return res.send('commands have been registered')
    } catch (e: any) {
        console.error(e.code)
        console.error(e.response?.data)
        return res.send(`${e.code} error from discord`)
    }
})


app.get('/', async (req, res) => {
    return res.send('Follow documentation ')
})


app.listen(8999, () => {
    console.log("Server is started")
})


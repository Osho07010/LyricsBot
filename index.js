const {
    Client,
    Events,
    GatewayIntentBits
} = require("discord.js");
const { discordToken, geniusToken } = require('./config.json');
const Genius = require("genius-lyrics");

const client = new Client({
    intents: Object.values(GatewayIntentBits).filter(Number.isInteger)
});

const genius = new Genius.Client(geniusToken);

client.once(Events.ClientReady, c => {
    console.log(`Ready! ${client.user.tag}`)
});

client.login(discordToken);

async function sendLyrics(message, lyrics) {
    const chunks = lyrics.match(/.{1,2000}/g);
    for (const chunk of chunks) {
        await message.channel.send(chunk);
    }
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!lyrics')) {
        const args = message.content.slice('!lyrics'.length).trim().split(/ +/);
        const songName = args.join(' ');
        
        try {

            const searches = await genius.songs.search(songName);
            const firstSong = searches[0];
            
            if (!firstSong) {
                message.channel.send('Lyrics not found.');
                return;
            }
            
            const lyrics = await firstSong.lyrics();
            if (!lyrics) {
                message.channel.send('Lyrics not found.');
                return;
            }
            
           
            await sendLyrics(message, lyrics);
        } catch (error) {
            console.error(error);
            message.channel.send('An error has occurred.');
        }
    }
});


const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource,AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Searches for a song and plays it in the voice channel you are in.')
        .addStringOption(option => option.setName('url').setDescription('The URL or search query of the song you want to play.').setRequired(true)),

	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel)  return await interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return await interaction.reply({ content: 'I need the permissions to join and speak in your voice channel!', ephemeral: true })
        }
        const url = interaction.options.getString('url');
        
         const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        })
        let stream = null;
        let info = null;
        let tries = 0;
        
        while (stream == null) {
            try {
                if (tries == 1){
                const search = await play.search(url, { limit: 1})
                info = await play.video_info(search[0].url)
                stream = await play.stream_from_info(info)
                } else {
                    info = await play.video_info(url)
                    stream = await play.stream_from_info(info)
                }
                
            } catch (error) {
                if (tries == 1) {
                    connection.destroy();
                    return await interaction.reply('An error occurred while trying to play the song.');
                }
                tries++;
            }
        }
        
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })
        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        player.play(resource)
        
        player.on(AudioPlayerStatus.Idle, () => {

            connection.destroy();
        })

        connection.subscribe(player)
        
        await interaction.reply(`Now playing: ${info.video_details.title}`);
	}	
};
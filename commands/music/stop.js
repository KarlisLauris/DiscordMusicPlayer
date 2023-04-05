const { SlashCommandBuilder } = require('discord.js');
const {getVoiceConnection} = require('@discordjs/voice');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the current song and bot leaves the channel.'),
	async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply({ content: 'I need the permissions to join and speak in your voice channel!', ephemeral: true });
        }


        const connection = getVoiceConnection(interaction.guildId);
        
        if (!connection) return interaction.reply({ content: 'I am not in a voice channel!', ephemeral: true });
        connection.destroy();
        await interaction.reply('Stopped the current song and left the voice channel.');
	}	
};
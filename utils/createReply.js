module.exports = {
    createReply: async function (interaction, content, ephemeral) {
        if (ephemeral == true) {
            await interaction.reply({ content: content, ephemeral: true });
        } else {
            await interaction.reply(content);
        }
    }
}
//const botconfig = require("./botconfig.json");
const tokenfile = require("./token.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
const serverid = "531574527335989269";

let requests = JSON.parse(fs.readFileSync("./database/requests.json", "utf8"));
let blacklist = JSON.parse(fs.readFileSync("./database/blacklist names.json", "utf8"));
let reqrem = JSON.parse(fs.readFileSync("./database/requests remove.json", "utf8"));
const nrpnames = new Set(); // Невалидные ники будут записаны в nrpnames
const sened = new Set(); // Уже отправленные запросы будут записаны в sened
const support_cooldown = new Set(); // Запросы от игроков.
const snyatie = new Set(); // Уже отправленные запросы на снятие роли быдут записаны в snyatie
const dev = new Set(); // Временная группа прав разработчика
dev.add("408740341135704065"); // Юки
dev.add("262477895694417921"); // Жуля
var key = 0;

var power = 1;
const cooldowncommand = new Set();

tags = ({
    "A": "Administrator",
});

let manytags = [
"A",
];
let rolesgg = ["Administrator"];
let canremoverole = ["Admin"];

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

function checknick (member, role, startnum, endnum, bot, message){
    if (member.roles.some(r => [role].includes(r.name))){
        let ruletagst = startnum
        let ruletagend = endnum
        let rpname = false;
        for (i in manytags){
            if (i >= ruletagst && i <= ruletagend)
            if (member.displayName.toUpperCase().includes(manytags[i])) rpname = true;
        }
        if (!rpname){
            if (!nrpnames.has(member.id)){
                for (var i in rolesgg){
                    let rolerem = bot.guilds.find(g => g.id == message.guild.id).roles.find(r => r.name == rolesgg[i]);
                    if (member.roles.some(role=>[rolesgg[i]].includes(role.name))){
                        member.removeRole(rolerem).then(() => {	
                            setTimeout(function(){
                                if(member.roles.has(rolerem)){
                                    member.removeRole(rolerem);
                                }
                            }, 5000);
                        }).catch(console.error);
                    }
                }
                nrpnames.add(member.id)
            }
        }
    }
}




bot.on("ready", async () => {
  console.log(`${bot.user.username} запущен на  ${bot.guilds.size} серверах!`);
  console.log(`Автор бота: Луняша`);
  console.log(`Автор некоторых систем: Kory_McGregor (Артём Мясников)`);
  //bot.guilds.find(g => g.id == "474975625011003393").channels.find(c => c.name == "general-startbot").send(`\`Бот МакДак запущен!\``);
    if(power == 1) bot.user.setGame("Режим модератора");
    if(power == 2) bot.user.setGame("Режим администратора");
    if(power == 3) bot.user.setGame("Режим LOCKED");

  //bot.user.setGame("on SourceCade!");
});

bot.login(process.env.token);

function getRandomArbitary(min, max)
{
  return Math.random() * (max - min) + min;
}



bot.on('message', async message => {
    if (message.channel.type == "dm") {
	    if(message.content == key) {
		message.channel.send("Ключ введён верно, скоро бот будет разблокирован, спасибо!");
		power = 1;
		bot.destroy().then(() => {
		bot.login(process.env.token)
		})
		return;
	    }
	    if(message.content == "/key") {
	    message.channel.send(`Ключ разблокировки: ${key}`);
	    }
	return;
    }
    
    if (message.guild.id != serverid && message.guild.id != "519051115191336984") return
   // if (message.type === "PINS_ADD") if (message.channel.name == "requests-for-roles") message.delete();
    if (message.content == "/ping") return message.reply("`я онлайн!`") && console.log(`Бот ответил ${message.member.displayName}, что я онлайн.`)
    if (message.member.id == bot.user.id) return;
	
	if (message.content.startsWith(`/run`)){
	if (!message.member.hasPermission("ADMINISTRATOR")) return message.delete();
	const args = message.content.slice(`/run`).split(/ +/);
	let cmdrun = args.slice(1).join(" ");
	eval(cmdrun);
		message.reply(`+`);
		message.delete();
	}
	if (message.content.startsWith(`/lock`)){
		if (!dev.has(message.author.id)) return message.reply(`\`У вас нет прав к управлению над ботом.\``) && message.delete()
		bot.user.setGame("Режим LOCKED");
		power = 3;
		key = getRandomArbitary(10000, 99999);
		parseInt(key);
		let author_bot = message.guild.members.find(m => m.id == 408740341135704065);
		if (!author_bot){
		message.reply(`\`я не смог отправить ключ разблокировки.. Ответственного лица нет на сервере.\``).then(msg => msg.delete(15000));
		return message.delete()
		}
		author_bot.send(`**Привет! Пользователь <@${message.author.id}> \`(${message.author.id})\` заблокировал бота из-за возможной угрозы серверу, держите ключ\n` +
		`** Ключ разблокировки: ** ${key}**`);	
		return message.reply(`\`БОТ ПЕРЕВЕДЁН В РЕЖИМ БЛОКИРОВКИ, ВЫПОЛНИТЕ ИНСТРУКЦИЮ ПО РАЗБЛОКИРОВКИ БОТА\``) && message.delete()
	}
    if (message.content.startsWith(`/reload`)){
        if (!dev.has(message.author.id)) return message.reply(`\`У вас нет прав к управлению над ботом.\``) && message.delete()
        const args = message.content.slice(`/reload`).split(/ +/);
        power = args.slice(1).join(" ");
        //message.channel.send(reload);
        if(!power) return message.reply('Ha-ha-ha)')
        if(power < 1 || power > 2) return message.reply(`\`Ты чо долбаёб? /reload [1 - moderation power | 2 - administration power]\``) && message.delete()
        reloader = message.author;
        channelsender = message.channel;
        message.channel.send(`\`[SYSTEM BALLS] Перезапускаю бота. Источник перезапуска:\`<@${reloader.id}>`);
        if(power == 2) {
            bot.destroy().then(() => {
                bot.login(process.env.atoken)
                })
        }
        if(power == 1) {
            bot.destroy().then(() => {
                bot.login(process.env.token)
                })
        }
   
    }
	
	
if (message.content.startsWith("/accinfo")){
        if (!message.member.hasPermission("MANAGE_ROLES")) return
        let user = message.guild.member(message.mentions.users.first());
        if (user){
            let userroles;
            await user.roles.filter(role => {
                if (userroles == undefined){
                    if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                }else{
                    if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                }
            })
            let perms;
            if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                perms = "[!] Пользователь модератор [!]";
            }else{
                perms = "У пользователя нет админ прав."
            }
            if (userroles == undefined){
                userroles = `отсутствуют.`
            }
            let date = user.user.createdAt;
            let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
            date = user.joinedAt
            let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
            const embed = new Discord.RichEmbed()
            .setColor("#FF0000")
            .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
            .setTimestamp()
            .addField(`Дата создания аккаунта и входа на сервер`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
            .addField("Roles and Permissions", `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\``)
            message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
            return message.delete();
        }else{
            const args = message.content.slice('/accinfo').split(/ +/)
            if (!args[1]) return
            let name = args.slice(1).join(" ");
            let foundmember = false;
            await message.guild.members.filter(f_member => {
                if (f_member.displayName.includes(name)){
                    foundmember = f_member
                }else if(f_member.user.tag.includes(name)){
                    foundmember = f_member
                }
            })
            if (foundmember){
                let user = foundmember
                let userroles;
                await user.roles.filter(role => {
                    if (userroles == undefined){
                        if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                    }else{
                        if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                    }
                })
                let perms;
                if (user.permissions.hasPermission("ADMINISTRATOR") || user.permissions.hasPermission("MANAGE_ROLES")){
                    perms = "[!] Пользователь модератор [!]";
                }else{
                    perms = "У пользователя нет админ прав."
                }
                if (userroles == undefined){
                    userroles = `отсутствуют.`
                }
                let date = user.user.createdAt;
                let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                date = user.joinedAt
                let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                const embed = new Discord.RichEmbed()
                .setColor("#FF0000")
                .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.avatarURL)
                .setTimestamp()
                .addField(`Краткая информация`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                .addField("Roles and Permissions", `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\``)
                message.reply(`**вот информация по поводу аккаунта <@${user.id}>**`, embed)
            }
            return message.delete();
        }
    }
	
	    if (message.content.toLowerCase().includes("роль") && !message.content.toLowerCase().includes(`сними`) && !message.content.toLowerCase().includes(`снять`)){
        // Проверить невалидный ли ник.
        if (nrpnames.has(message.member.displayName)){
            if(message.member.roles.some(r=>rolesgg.includes(r.name)) ) {
                for (var i in rolesgg){
                    let rolerem = bot.guilds.find(g => g.id == message.guild.id).roles.find(r => r.name == rolesgg[i]);
                    if (message.member.roles.some(role=>[rolesgg[i]].includes(role.name))){
                        await message.member.removeRole(rolerem); // Забрать роли указанные ранее.
                    }
                }
            }
            message.react(`📛`) // Поставить знак стоп под отправленным сообщением.
            return // Выход
        }
        // Проверить все доступные тэги
        for (var i in manytags){
            if (message.member.displayName.toLowerCase().includes("[" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + "]") || message.member.displayName.toLowerCase().includes("(" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + ")") || message.member.displayName.toLowerCase().includes("{" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + "}")){
                let rolename = tags[manytags[i].toUpperCase()] // Указать название роли по соответствию с тэгом
                let role = message.guild.roles.find(r => r.name == rolename); // Найти эту роль на discord сервере.
                let reqchat = message.guild.channels.find(c => c.name == `role`); // Найти чат на сервере.
                if (!role){
                    message.reply(`\`Ошибка выполнения. Роль ${rolename} не была найдена.\``)
                    return console.error(`Роль ${rolename} не найдена!`);
                }else if(!reqchat){
                    message.reply(`\`Ошибка выполнения. Канал requests-for-roles не был найден!\``)
                    return console.error(`Канал role не был найден!`)
                }
                if (message.member.roles.some(r => [rolename].includes(r.name))){
                    return message.react(`👌`) // Если роль есть, поставить окей.
                }
                if (sened.has(message.member.displayName)) return message.react(`🕖`) // Если уже отправлял - поставить часы.
                let nickname = message.member.displayName;
                const embed = new Discord.RichEmbed()
                .setTitle("`Discord » Проверка на валидность ник нейма.`")
                .setColor("#483D8B")
                .addField("Аккаунт", `\`Пользователь:\` <@${message.author.id}>`, true)
                .addField("Никнейм", `\`Ник:\` ${nickname}`, true)
                .addField("Роль для выдачи", `\`Роль для выдачи:\` <@&${role.id}>`)
                .addField("Отправлено с канала", `<#${message.channel.id}>`)
                .addField("Информация по выдачи", `\`[✔] - выдать роль\`\n` + `\`[❌] - отказать в выдачи роли\`\n` + `\`[D] - удалить сообщение\``)
                .setFooter("© Support Team | by Kory_McGregor")
                .setTimestamp()
                reqchat.send(embed).then(async msgsen => {
                    await msgsen.react('✔')
                    await msgsen.react('❌')
                    await msgsen.react('🇩')
                    await msgsen.pin();
                })
                sened.add(message.member.displayName); // Пометить данный ник, что он отправлял запрос.
                return message.react(`📨`);
            }
        }
    }
	
	
	if (message.content.toLowerCase().includes("сними") || message.content.toLowerCase().includes("снять")){
        if (!message.member.roles.some(r => canremoverole.includes(r.name)) && !message.member.hasPermission("MANAGE_ROLES")) return
        const args = message.content.split(/ +/)
        let onebe = false;
        let twobe = false;
        args.forEach(word => {
            if (word.toLowerCase().includes(`роль`)) onebe = true
            if (word.toLowerCase().includes(`у`)) twobe = true
        })
        if (!onebe || !twobe) return
        if (message.mentions.users.size > 1) return message.react(`📛`)
        let user = message.guild.member(message.mentions.users.first());
        if (!user) return message.react(`📛`)
        if (snyatie.has(message.author.id + `=>` + user.id)) return message.react(`🕖`)
        let reqchat = message.guild.channels.find(c => c.name == `role`); // Найти чат на сервере.
        if(!reqchat){
            message.reply(`\`Ошибка выполнения. Канал requests-for-roles не был найден!\``)
            return console.error(`Канал requests-for-roles не был найден!`)
        }
        let roleremove = user.roles.find(r => rolesgg.includes(r.name));
        if (!roleremove) return message.react(`📛`)

        message.reply(`\`напишите причину снятия роли.\``).then(answer => {
            message.channel.awaitMessages(response => response.member.id == message.member.id, {
                max: 1,
                time: 60000,
                errors: ['time'],
            }).then((collected) => {
                const embed = new Discord.RichEmbed()
                .setTitle("`Discord » Запрос о снятии роли.`")
                .setColor("#483D8B")
                .addField("Отправитель", `\`Пользователь:\` <@${message.author.id}>`)
                .addField("Кому снять роль", `\`Пользователь:\` <@${user.id}>`)
                .addField("Роль для снятия", `\`Роль для снятия:\` <@&${roleremove.id}>`)
                .addField("Отправлено с канала", `<#${message.channel.id}>`)
                .addField("Причина снятия роли", `${collected.first().content}`)
                .addField("Информация", `\`[✔] - снять роль\`\n` + `\`[❌] - отказать в снятии роли\`\n` + `\`[D] - удалить сообщение\``)
                .setFooter("© Support Team | by Kory_McGregor")
                .setTimestamp()
                reqchat.send(embed).then(async msgsen => {
                    answer.delete();
                    collected.first().delete();
                    await msgsen.react('✔')
                    await msgsen.react('❌')
                    await msgsen.react('🇩')
                    await msgsen.pin();
                })
                snyatie.add(message.author.id + `=>` + user.id)
                return message.react(`📨`);
            }).catch(() => {
                return answer.delete()
            });
        });
    }

   
});


bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return; // Если не будет добавление или удаление смайлика, то выход
    if (event.t == "MESSAGE_REACTION_ADD"){
        let event_guildid = event.d.guild_id // ID discord сервера
        let event_channelid = event.d.channel_id // ID канала
        let event_userid = event.d.user_id // ID того кто поставил смайлик
        let event_messageid = event.d.message_id // ID сообщение куда поставлен смайлик
        let event_emoji_name = event.d.emoji.name // Название смайлика

        if (event_userid == bot.user.id) return // Если поставил смайлик бот то выход
        if (event_guildid != serverid) return // Если сервер будет другой то выход

        let server = bot.guilds.find(g => g.id == event_guildid); // Получить сервер из его ID
        let channel = server.channels.find(c => c.id == event_channelid); // Получить канал на сервере по списку каналов
        let message = await channel.fetchMessage(event_messageid); // Получить сообщение из канала
        let member = server.members.find(m => m.id == event_userid); // Получить пользователя с сервера

        if (channel.name != `role`) return // Если название канала не будет 'requests-for-roles', то выйти

        if (event_emoji_name == "🇩"){
            if (!message.embeds[0]){
                channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                return message.delete();
            }else if (message.embeds[0].title == "`Discord » Проверка на валидность ник нейма.`"){
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_user || !field_nickname || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                }else{
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_author || !field_user || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос на снятие роли.\``);
                }else{
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос на снятие роли от ${field_author.displayName}, с ID: ${field_author.id}\``);
                }
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete();
            }
        }else if(event_emoji_name == "❌"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на выдачу роли.\nВаш ник при отправке: ${field_nickname}\nУстановите ник на: [Фракция] Имя_Фамилия [Ранг]\``)
                nrpnames.add(field_nickname); // Добавить данный никнейм в список невалидных
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (member.id == field_author.id) return channel.send(`\`[ERROR]\` \`${member.displayName} свои запросы отклонять нельзя!\``).then(msg => msg.delete(5000))
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                    return message.delete();
                }
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос на снятие роли от\` <@${field_author.id}>\`, с ID: ${field_author.id}\``);
                field_channel.send(`<@${field_author.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на снятие роли пользователю:\` <@${field_user.id}>`)
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete();
            }
        }else if (event_emoji_name == "✔"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (field_user.roles.some(r => field_role.id == r.id)){
                    if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                    return message.delete(); // Если роль есть, то выход
                }
                let rolesremoved = false;
                let rolesremovedcount = 0;
                if (field_user.roles.some(r=>rolesgg.includes(r.name))) {
                    for (var i in rolesgg){
                        let rolerem = server.roles.find(r => r.name == rolesgg[i]);
                        if (field_user.roles.some(role=>[rolesgg[i]].includes(role.name))){
                            rolesremoved = true;
                            rolesremovedcount = rolesremovedcount+1;
                            await field_user.removeRole(rolerem); // Забрать фракционные роли
                        }
                    }
                }
                await field_user.addRole(field_role); // Выдать роль по соответствию с тэгом
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил запрос от ${field_nickname}, с ID: ${field_user.id}\``);
                if (rolesremoved){
                    if (rolesremovedcount == 1){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! ${rolesremovedcount} роль другой фракции была убрана.\``)
                    }else if (rolesremovedcount < 5){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! Остальные ${rolesremovedcount} роли других фракций были убраны.\``)
                    }else{
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! Остальные ${rolesremovedcount} ролей других фракций были убраны.\``)
                    }
                }else{
                    field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана!\``)
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (member.id == field_author.id) return channel.send(`\`[ERROR]\` \`${member.displayName} свои запросы принимать нельзя!\``).then(msg => msg.delete(5000))
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                    return message.delete();
                }
                field_user.removeRole(field_role);
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил снятие роли (${field_role.name}) от\` <@${field_author.id}>, \`пользователю\` <@${field_user.id}>, \`с ID: ${field_user.id}\``);
                field_channel.send(`**<@${field_user.id}>, с вас сняли роль**  <@&${field_role.id}>  **по запросу от <@${field_author.id}>.**`)
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete()
            }
        }
    }
});

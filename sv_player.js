Wait = (ms) => new Promise(res => setTimeout(res, ms));

Core.Players = {};
Core.Player = {
    Login: (source, citizenId, newData) => {
        if (source && source !== "") {
            if (citizenId) {
                const license = Core.Functions.GetIdentifier(source, 'license');
                const PlayerData = MySQL.prepare.await('SELECT * FROM players WHERE citizenid = ?', [citizenId]);

                if (PlayerData && license === PlayerData.license) {
                    PlayerData.money = JSON.parse(PlayerData.money);
                    PlayerData.job = JSON.parse(PlayerData.job);
                    PlayerData.position = JSON.parse(PlayerData.position);
                    PlayerData.metadata = JSON.parse(PlayerData.metadata);
                    PlayerData.charinfo = JSON.parse(PlayerData.charinfo);

                    if (PlayerData.gang) PlayerData.gang = JSON.parse(PlayerData.gang);
                    else PlayerData.gang = {};

                    Core.Player.CheckPlayerData(source, PlayerData);
                } else {
                    DropPlayer(source, "Vous n'etes pas autorisé à rejoindre le serveur | Erreur de correspondance");
                    emit('Core-Log:Server:CreateLog', 'anticheat', 'Anti-Cheat', 'white', `${GetPlayerName(source)} has been dropped for character joining exploit`, false);
                }
            } else Core.Player.CheckPlayerData(source, newData);

            return true;
        } else {
            Core.ShowError(GetCurrentResourceName(), 'ERROR CORE.PLAYER.LOGIN - NO SOURCE GIVEN !');

            return false;
        }
    },

    GetOfflinePlayer: (citizenId) => {
        if (citizenId) {
            const PlayerData = MySQL.prepare.await('SELECT * FROM players WHERE citizenid = ?', [citizenId]);

            if (PlayerData) {
                PlayerData.money = JSON.parse(PlayerData.money);
                PlayerData.job = JSON.parse(PlayerData.job);
                PlayerData.position = JSON.parse(PlayerData.position);
                PlayerData.metadata = JSON.parse(PlayerData.metadata);
                PlayerData.charinfo = JSON.parse(PlayerData.charinfo);

                if (PlayerData.gang) PlayerData.gang = JSON.parse(PlayerData.gang);
                else PlayerData.gang = {};

                return Core.Player.CheckPlayerData(null, PlayerData);
            }
        }

        return null
    },

    GetPlayerByLicense: (license) => {
        if (license) {
            const PlayerData = MySQL.prepare.await('SELECT * FROM players WHERE license = ?', [license]);

            if (PlayerData) {
                PlayerData.money = JSON.parse(PlayerData.money);
                PlayerData.job = JSON.parse(PlayerData.job);
                PlayerData.position = JSON.parse(PlayerData.position);
                PlayerData.metadata = JSON.parse(PlayerData.metadata);
                PlayerData.charinfo = JSON.parse(PlayerData.charinfo);

                if (PlayerData.gang) PlayerData.gang = JSON.parse(PlayerData.gang);
                else PlayerData.gang = {};

                return Core.Player.CheckPlayerData(null, PlayerData);
            }
        }

        return null;
    },

    CheckPlayerData: (source, PlayerData) => {
        PlayerData = PlayerData || {};

        let Offline = true;

        if (source) {
            PlayerData.source = source;
            PlayerData.license = PlayerData.license || Core.Functions.GetIdentifier(source, 'license');
            PlayerData.name = GetPlayerName(source);

            Offline = false;
        }

        PlayerData.citizenid = PlayerData.citizenid || Core.Player.CreateCitizenId();
        PlayerData.cid = PlayerData.cid || 1;
        PlayerData.money = PlayerData.money || {};
        PlayerData.optin = PlayerData.optin || true;

        PlayerData.charinfo = PlayerData.charinfo || {}
        PlayerData.charinfo.firstname = PlayerData.charinfo.firstname || 'Firstname'
        PlayerData.charinfo.lastname = PlayerData.charinfo.lastname || 'Lastname'
        PlayerData.charinfo.birthdate = PlayerData.charinfo.birthdate || '00-00-0000'
        PlayerData.charinfo.gender = PlayerData.charinfo.gender || 0
        PlayerData.charinfo.backstory = PlayerData.charinfo.backstory || 'placeholder backstory'
        PlayerData.charinfo.nationality = PlayerData.charinfo.nationality || 'USA'
        PlayerData.charinfo.phone = PlayerData.charinfo.phone || Core.Functions.CreatePhoneNumber()
        PlayerData.charinfo.account = PlayerData.charinfo.account || Core.Functions.CreateAccountNumber()

        PlayerData.metadata = PlayerData.metadata || {}
        PlayerData.metadata['hunger'] = PlayerData.metadata['hunger'] || 100
        PlayerData.metadata['thirst'] = PlayerData.metadata['thirst'] || 100
        PlayerData.metadata['stress'] = PlayerData.metadata['stress'] || 0
        PlayerData.metadata['isdead'] = PlayerData.metadata['isdead'] || false
        PlayerData.metadata['inlaststand'] = PlayerData.metadata['inlaststand'] || false
        PlayerData.metadata['armor'] = PlayerData.metadata['armor'] || 0
        PlayerData.metadata['ishandcuffed'] = PlayerData.metadata['ishandcuffed'] || false
        PlayerData.metadata['tracker'] = PlayerData.metadata['tracker'] || false
        PlayerData.metadata['injail'] = PlayerData.metadata['injail'] || 0
        PlayerData.metadata['jailitems'] = PlayerData.metadata['jailitems'] || {}
        PlayerData.metadata['status'] = PlayerData.metadata['status'] || {}
        PlayerData.metadata['phone'] = PlayerData.metadata['phone'] || {}
        PlayerData.metadata['fitbit'] = PlayerData.metadata['fitbit'] || {}
        PlayerData.metadata['bloodtype'] = PlayerData.metadata['bloodtype'] || Core.Config.Player.Bloodtypes[Math.floor(Math.random() * (Core.Config.Player.Bloodtypes.length - 0 + 1))]
        PlayerData.metadata['dealerrep'] = PlayerData.metadata['dealerrep'] || 0
        PlayerData.metadata['craftingrep'] = PlayerData.metadata['craftingrep'] || 0
        PlayerData.metadata['attachmentcraftingrep'] = PlayerData.metadata['attachmentcraftingrep'] || 0
        PlayerData.metadata['currentapartment'] = PlayerData.metadata['currentapartment'] || null
        PlayerData.metadata['jobrep'] = PlayerData.metadata['jobrep'] || {}
        PlayerData.metadata['jobrep']['tow'] = PlayerData.metadata['jobrep']['tow'] || 0
        PlayerData.metadata['jobrep']['trucker'] = PlayerData.metadata['jobrep']['trucker'] || 0
        PlayerData.metadata['jobrep']['taxi'] = PlayerData.metadata['jobrep']['taxi'] || 0
        PlayerData.metadata['jobrep']['hotdog'] = PlayerData.metadata['jobrep']['hotdog'] || 0
        PlayerData.metadata['callsign'] = PlayerData.metadata['callsign'] || 'NO CALLSIGN'
        PlayerData.metadata['fingerprint'] = PlayerData.metadata['fingerprint'] || Core.Player.CreateFingerId()
        PlayerData.metadata['walletid'] = PlayerData.metadata['walletid'] || Core.Player.CreateWalletId()
        PlayerData.metadata['criminalrecord'] = PlayerData.metadata['criminalrecord'] || {
            'hasRecord': false,
            'date': null
        }
        PlayerData.metadata['licences'] = PlayerData.metadata['licences'] || {
            'driver': true,
            'business': false,
            'weapon': false
        }
        PlayerData.metadata['inside'] = PlayerData.metadata['inside'] || {
            house: null,
            apartment: {
                apartmentType: null,
                apartmentId: null,
            }
        }
        PlayerData.metadata['phonedata'] = PlayerData.metadata['phonedata'] || {
            SerialNumber: Core.Player.CreateSerialNumber(),
            InstalledApps: {},
        }

        if (PlayerData.job && PlayerData.job.name && !Core.Shared.Jobs[PlayerData.job.name]) { PlayerData.job = null }
        PlayerData.job = PlayerData.job || {}
        PlayerData.job.name = PlayerData.job.name || 'unemployed'
        PlayerData.job.label = PlayerData.job.label || 'Civilian'
        PlayerData.job.payment = PlayerData.job.payment || 10
        PlayerData.job.type = PlayerData.job.type || 'none'
        if (Core.Shared.ForceJobDefaultDutyAtLogin || PlayerData.job.onduty == null) {
            PlayerData.job.onduty = Core.Shared.Jobs[PlayerData.job.name].defaultDuty
        }
        PlayerData.job.isboss = PlayerData.job.isboss || false
        PlayerData.job.grade = PlayerData.job.grade || {}
        PlayerData.job.grade.name = PlayerData.job.grade.name || 'Freelancer'
        PlayerData.job.grade.level = PlayerData.job.grade.level || 0

        if (PlayerData.gang && PlayerData.gang.name && !Core.Shared.Gangs[PlayerData.gang.name]) { PlayerData.gang = null }
        PlayerData.gang = PlayerData.gang || {}
        PlayerData.gang.name = PlayerData.gang.name || 'none'
        PlayerData.gang.label = PlayerData.gang.label || 'No Gang Affiliaton'
        PlayerData.gang.isboss = PlayerData.gang.isboss || false
        PlayerData.gang.grade = PlayerData.gang.grade || {}
        PlayerData.gang.grade.name = PlayerData.gang.grade.name || 'none'
        PlayerData.gang.grade.level = PlayerData.gang.grade.level || 0

        PlayerData.position = PlayerData.position || Core.Config.DefaultSpawn
        PlayerData.items = GetResourceState('qb-inventory') !== 'missing' && exports.CoreInventory.LoadInventory(PlayerData.source, PlayerData.citizenid) || {}

        return Core.Player.CreatePlayer(PlayerData, Offline)
    },

    Logout: (source) => {
        emitNet('Core:Client:OnPlayerUnload', source);
        emit('Core:Server:OnPlayerUnload', source);
        emitNet('Core:Player:UpdatePlayerData', source);

        Wait(200);

        Core.Players[source] = null;
    },

    CreatePlayer: (PlayerData, Offline) => {
        const self = {
            Functions: {
                UpdatePlayerData: () => {
                    if (self.Offline) return;

                    emit('Core:Player:SetPlayerData', self.PlayerData);
                    emitNet('Core:Player:SetPlayerData', self.PlayerData.source, self.PlayerData)
                },

                SetJob: (job, grade) => {
                    job = job.toLowerCase();
                    grade = grade.toString() || 0;

                    if (!Core.Shared.Jobs[job]) return false;

                    self.PlayerData.job.name = job;
                    self.PlayerData.job.label = Core.Shared.Jobs[job].label;
                    self.PlayerData.job.onduty = Core.Shared.Jobs[job].defaultDuty;
                    self.PlayerData.job.type = Core.Shared.Jobs[job].type || 'none';

                    if (Core.Shared.Jobs[job].grades[grade]) {
                        const jobGrade = Core.Shared.Jobs[job].grades[grade];

                        self.PlayerData.job.grade = {};
                        self.PlayerData.job.grade.name = jobGrade.name;
                        self.PlayerData.job.grade.level = parseInt(grade);
                        self.PlayerData.job.payment = jobGrade.payment || 30
                        self.PlayerData.job.isboss = jobGrade.isboss || false
                    } else {
                        self.PlayerData.job.grade = {}
                        self.PlayerData.job.grade.name = 'No Grades'
                        self.PlayerData.job.grade.level = 0
                        self.PlayerData.job.payment = 30
                        self.PlayerData.job.isboss = false
                    }

                    if (!self.Offline) {
                        self.Functions.UpdatePlayerData();

                        emit('Core:Server:OnJobUpdate', self.PlayerData.source, self.PlayerData.job);
                        emitNet('Core:Client:OnJobUpdate', self.PlayerData.source, self.PlayerData.job);
                    }

                    return true;
                },

                SetGang: (gang, grade) => {
                    gang = gang.toLowerCase()
                    grade = grade.toString() || '0'
                    if (!Core.Shared.Gangs[gang]) return false;

                    self.PlayerData.gang.name = gang
                    self.PlayerData.gang.label = Core.Shared.Gangs[gang].label

                    if (Core.Shared.Gangs[gang].grades[grade]) {
                        const ganggrade = Core.Shared.Gangs[gang].grades[grade]
                        self.PlayerData.gang.grade = {}
                        self.PlayerData.gang.grade.name = ganggrade.name
                        self.PlayerData.gang.grade.level = parseInt(grade)
                        self.PlayerData.gang.isboss = ganggrade.isboss || false
                    } else {
                        self.PlayerData.gang.grade = {}
                        self.PlayerData.gang.grade.name = 'No Grades'
                        self.PlayerData.gang.grade.level = 0
                        self.PlayerData.gang.isboss = false
                    }

                    if (!self.Offline) {
                        self.Functions.UpdatePlayerData()
                        TriggerEvent('Core:Server:OnGangUpdate', self.PlayerData.source, self.PlayerData.gang)
                        TriggerClientEvent('Core:Client:OnGangUpdate', self.PlayerData.source, self.PlayerData.gang)
                    }

                    return true
                },

                Notify: (text, type, length) => {
                    emitNet('Core:Notify', self.PlayerData.source, text, type, length);
                },

                HasItem: (items, amount) => {
                    Core.Functions.HasItem(self.PlayerData.source, items, amount);
                },

                SetJobDuty: (onDuty) => {
                    self.PlayerData.job.onduty = !!onDuty;

                    emit('Core:Server:OnJobUpdate', self.PlayerData.source, self.PlayerData.job);
                    emitNet('Core:Client:OnJobUpdate', self.PlayerData.source, self.PlayerData.job);

                    self.Functions.UpdatePlayerData();
                },

                SetPlayerData: (key, val) => {
                    if (!key || typeof key !== 'string') return;

                    self.PlayerData[key] = val;

                    self.Functions.UpdatePlayerData();
                },

                SetMetaData: (meta, val) => {
                    if (!meta || typeof meta !== 'string') return;

                    if (meta === "hunger" || meta === 'thirst') val = val > 100 && 100 || val;

                    self.PlayerData.metadata[meta] = val;
                    self.Functions.UpdatePlayerData();
                },

                GetMetaData: (meta) => {
                    if (!meta || typeof meta !== "string") return;

                    return self.PlayerData.metadata[meta];
                },

                AddJobReputation: (amount) => {
                    if (!amount) return;

                    amount = Number(amount);

                    self.PlayerData.metadata['jobrep'][self.PlayerData.job.name] += amount;
                    self.Functions.UpdatePlayerData();
                },

                AddMoney: (moneyType, amount, reason) => {
                    reason = reason || "unknowm";

                    moneyType = moneyType.toLowerCase();

                    amount = Number(amount);

                    if (amount < 0) return;

                    if (!self.PlayerData.money[moneyType]) return false;

                    self.PlayerData.money[moneyType] += amount;

                    if (!self.Offline) {
                        self.Functions.UpdatePlayerData();

                        if (amount > 100000) emit('Core-Log:Server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', `**${GetPlayerName(self.PlayerData.source)} (citizenId: ${self.PlayerData.citizenid} | id: ${self.PlayerData.source}) $${amount} (${moneyType}) balance: ${self.PlayerData.money[moneyType]} reason: ${reason}`, true);
                        else emit('Core-Log:Server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', `**${GetPlayerName(self.PlayerData.source)} (citizenId: ${self.PlayerData.citizenid} | id: ${self.PlayerData.source}) $${amount} (${moneyType}) balance: ${self.PlayerData.money[moneyType]} reason: ${reason}`);

                        emitNet('CoreHud:Client:OnMoneyChange', self.PlayerData.source, moneyType, amount, false);
                        emitNet('Core:Client:OnMoneyChange', self.PlayerData.source, moneyType, amount, 'add', reason);

                        emit('Core:Server:OnMoneyChange', self.PlayerData.source, moneyType, amount, 'add', reason);
                    }

                    return true
                },

                RemoveMoney: (moneyType, amount, reason) => {
                    reason = reason || "unknowm";

                    moneyType = moneyType.toLowerCase();

                    amount = Number(amount);

                    if (amount < 0) return;

                    if (!self.PlayerData.money[moneyType]) return false;

                    for (const mt of Core.Config.Money.DontAllowMinus) {
                        if (mt === moneyType) {
                            if ((self.PlayerData.money[moneyType] - amount) < 0) return false;
                        }
                    }

                    self.PlayerData.money[moneyType] -= amount;

                    if (!self.Offline) {
                        self.Functions.UpdatePlayerData();

                        if (amount > 100000) emit('Core-Log:Server:CreateLog', 'playermoney', 'RemoveMoney', 'red', `**${GetPlayerName(self.PlayerData.source)} (citizenId: ${self.PlayerData.citizenid} | id: ${self.PlayerData.source}) $${amount} (${moneyType}) balance: ${self.PlayerData.money[moneyType]} reason: ${reason}`, true);
                        else emit('Core-Log:Server:CreateLog', 'playermoney', 'RemoveMoney', 'red', `**${GetPlayerName(self.PlayerData.source)} (citizenId: ${self.PlayerData.citizenid} | id: ${self.PlayerData.source}) $${amount} (${moneyType}) balance: ${self.PlayerData.money[moneyType]} reason: ${reason}`);

                        emitNet('CoreHud:Client:OnMoneyChange', self.PlayerData.source, moneyType, amount, false);

                        if (moneyType === "bank") emitNet('CorePhone:Client:RemoveBankMoney', self.PlayerData.source, amount);

                        emitNet('Core:Client:OnMoneyChange', self.PlayerData.source, moneyType, amount, 'add', reason);

                        emit('Core:Server:OnMoneyChange', self.PlayerData.source, moneyType, amount, 'add', reason);
                    }

                    return true
                },

                GetMoney: (moneyType) => {
                    if (!moneyType || !self.PlayerData.money[moneyType]) return false;

                    moneyType = moneyType.toLowerCase();

                    return self.PlayerData.money[moneyType];
                },

                SetCreditCard: (cardNumber) => {
                    self.PlayerData.charinfo.card = cardNumber;
                    self.Functions.UpdatePlayerData();
                },

                GetCardSlot: (cardNumber, cardType) => {
                    const item = cardType.toString().toLowerCase();
                    const slots = exports.CoreInventory.GetSlotsByItem(self.PlayerData.items, item)

                    for (const slot of slots) {
                        if (slot) {
                            if (self.PlayerData.items[slot].info.cardNumber === cardNumber) return slot;
                        }
                    }

                    return null;
                },

                Save: () => {
                    if (self.Offline) {
                        Core.Player.SaveOffline(self.PlayerData);
                    } else {
                        Core.Player.Save(self.PlayerData.source);
                    }
                },

                Logout: () => {
                    if (self.Offline) return;

                    Core.Player.Logout(self.PlayerData.source);
                },

                AddMethod: (methodName, handler) => {
                    self.Functions[methodName] = handler;
                },

                AddField: (fieldName, data) => {
                    self[fieldName] = data;
                }
            },
            PlayerData: PlayerData,
            Offline: Offline
        }

        if (self.Offline) return self
        else {
            Core.Players[self.PlayerData.source] = self;
            Core.Player.Save(self.PlayerData.source);

            emit('Core:Server:PlayerLoaded', self);

            self.Functions.UpdatePlayerData();
        }
    },

    Save: (source) => {
        const ped = GetPlayerPed(source);
        const pCoords = GetEntityCoords(ped);
        const PlayerData = Core.Players[source].PlayerData;

        if (PlayerData) {
            MySQL.insert('INSERT INTO players (citizenid, cid, license, name, money, charinfo, job, gang, position, metadata) VALUES (:citizenid, :cid, :license, :name, :money, :charinfo, :job, :gang, :position, :metadata) ON DUPLICATE KEY UPDATE cid = :cid, name = :name, money = :money, charinfo = :charinfo, job = :job, gang = :gang, position = :position, metadata = :metadata', {
                citizenid: PlayerData.citizenid,
                cid: tonumber(PlayerData.cid),
                license: PlayerData.license,
                name: PlayerData.name,
                money: json.encode(PlayerData.money),
                charinfo: json.encode(PlayerData.charinfo),
                job: json.encode(PlayerData.job),
                gang: json.encode(PlayerData.gang),
                position: json.encode(pcoords),
                metadata: json.encode(PlayerData.metadata)
            })

            if(GetResourceState('CoreInventory') !== 'missing') exports.CoreInventory.SaveInventory(source);

            Core.ShowSuccess(GetCurrentResourceName(), `${PlayerData.name} PLAYER SAVED`)
        } else {
            Core.ShowError(GetCurrentResourceName(), 'ERROR CORE.PLAYER.SAVE - PLAYERDATA IS EMPTY!')
        }
    },

    SaveOffline: (PlayerData) => {
        
    }
}

Core.Functions.AddPlayerMethod = (ids, methodName, handler) => {
    const idType = typeof ids;

    if (idType === "number") {
        if (ids == -1) {
            for (const player of Core.Players) {
                player.Functions.AddMethod(methodName, handler);
            }
        } else {
            if (!Core.Players[ids]) return;

            Core.Players[ids].Functions.AddMethod(methodName, handler);
        }
    } else if (idType === 'object' && Array.isArray(ids)) {
        for (const id of ids) {
            Core.Functions.AddPlayerMethod(id, methodName, handler);
        }
    }
};

Core.Functions.AddPlayerField = (ids, fieldName, data) => {
    const idType = typeof ids;

    if (idType === 'number') {
        if (ids == -1) {
            for (const player of Core.Players) {
                player.Functions.AddField(fieldName, data);
            }
        } else {
            if (!Core.Players[ids]) return;

            Core.Players[ids].Functions.AddField(fieldName, data);
        }
    } else if (idType === 'object' && Array.isArray(ids)) {
        for (const id of ids) {
            Core.Functions.AddPlayerField(id, fieldName, data);
        }
    }
}
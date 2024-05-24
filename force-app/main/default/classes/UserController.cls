public with sharing class UserController {

    @AuraEnabled
    public static String createUser(String username, String firstName, String lastName, String profileName, String email, Id contactId) {
        try {
            // Récupérer l'ID du profil en fonction de son nom
            Id userProfileId = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1].Id;

            // Créer un nouvel utilisateur avec les informations fournies
            User newUser = new User(
                Username = username,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Alias = 'Default', // Exemple de valeur pour le champ Alias
                TimeZoneSidKey = 'America/New_York', // Exemple de valeur pour le champ Time Zone
                LocaleSidKey = 'en_US', // Exemple de valeur pour le champ Locale
                EmailEncodingKey = 'UTF-8', // Exemple de valeur pour le champ Email Encoding
                ProfileId = userProfileId, // Utiliser l'ID du profil récupéré
                LanguageLocaleKey = 'en_US', // Exemple de valeur pour le champ Language
                ContactId = contactId
            );

            // Insérer le nouvel utilisateur dans Salesforce
            insert newUser;

            // Retourner l'ID de l'utilisateur créé
            return newUser.Id;
        } catch (Exception e) {
            // Retourner un message d'erreur en cas d'échec
            throw new AuraHandledException('Erreur lors de la création de l\'utilisateur : ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void assignPermissionSets(List<String> permSetNames, String userId) {
        try {
            // Vérifier si les noms des Permission Sets et l'ID de l'utilisateur ne sont pas nuls ou vides
            if (permSetNames.isEmpty() || String.isBlank(userId)) {
                throw new IllegalArgumentException('Les noms des Permission Sets et l\'ID de l\'utilisateur sont requis.');
            }

            System.debug('Recherche des Permission Sets avec les noms : ' + permSetNames);

            // Récupérer les IDs des Permission Sets en fonction de leurs noms
            List<PermissionSet> permSetList = [
                SELECT Id, Name 
                FROM PermissionSet 
                WHERE Name IN :permSetNames
            ];

            // Vérifier si des Permission Sets ont été trouvés
            if (permSetList.isEmpty()) {
                throw new IllegalArgumentException('Aucun des Permission Sets spécifiés n\'a été trouvé.');
            }

            // Créer une liste pour stocker les enregistrements PermissionSetAssignment
            List<PermissionSetAssignment> psaList = new List<PermissionSetAssignment>();

            // Créer un enregistrement PermissionSetAssignment pour chaque Permission Set trouvé
            for (PermissionSet permSet : permSetList) {
                PermissionSetAssignment psa = new PermissionSetAssignment(
                    AssigneeId = userId,
                    PermissionSetId = permSet.Id
                );
                psaList.add(psa);
            }

            // Insérer tous les enregistrements PermissionSetAssignment
            insert psaList;

            // Ajouter des journaux de débogage pour la confirmation
            System.debug('PermissionSets ' + permSetNames + ' assigned to user ' + userId);
            for (PermissionSetAssignment psa : psaList) {
                System.debug('Assigned PermissionSet: ' + psa.PermissionSetId + ' to User: ' + psa.AssigneeId);
            }

        } catch (Exception e) {
            // Gestion des erreurs
            System.debug('Erreur lors de l\'attribution des Permission Sets : ' + e.getMessage());
            throw new AuraHandledException('Erreur lors de l\'attribution des Permission Sets : ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void assignPermissionSetLicenses(List<String> permSetLicenseNames, String userId) {
        try {
            // Vérifier si les noms des Permission Set Licenses et l'ID de l'utilisateur ne sont pas nuls ou vides
            if (permSetLicenseNames.isEmpty() || String.isBlank(userId)) {
                throw new IllegalArgumentException('Les noms des Permission Set Licenses et l\'ID de l\'utilisateur sont requis.');
            }

            System.debug('Recherche des Permission Set Licenses avec les noms : ' + permSetLicenseNames);

            // Récupérer les IDs des Permission Set Licenses en fonction de leurs noms
            List<PermissionSetLicense> permSetLicenseList = [
                SELECT Id, DeveloperName 
                FROM PermissionSetLicense 
                WHERE DeveloperName IN :permSetLicenseNames
            ];

            // Vérifier si des Permission Set Licenses ont été trouvés
            if (permSetLicenseList.isEmpty()) {
                throw new IllegalArgumentException('Aucun des Permission Set Licenses spécifiés n\'a été trouvé.');
            }

            // Créer une liste pour stocker les enregistrements PermissionSetLicenseAssign
            List<PermissionSetLicenseAssign> pslaList = new List<PermissionSetLicenseAssign>();

            // Créer un enregistrement PermissionSetLicenseAssign pour chaque Permission Set License trouvé
            for (PermissionSetLicense permSetLicense : permSetLicenseList) {
                PermissionSetLicenseAssign psla = new PermissionSetLicenseAssign(
                    AssigneeId = userId,
                    PermissionSetLicenseId = permSetLicense.Id
                );
                pslaList.add(psla);
            }

            // Insérer tous les enregistrements PermissionSetLicenseAssign
            insert pslaList;

            // Ajouter des journaux de débogage pour la confirmation
            System.debug('PermissionSetLicenses ' + permSetLicenseNames + ' assigned to user ' + userId);
            for (PermissionSetLicenseAssign psla : pslaList) {
                System.debug('Assigned PermissionSetLicense: ' + psla.PermissionSetLicenseId + ' to User: ' + psla.AssigneeId);
            }

        } catch (Exception e) {
            // Gestion des erreurs
            System.debug('Erreur lors de l\'attribution des Permission Set Licenses : ' + e.getMessage());
            throw new AuraHandledException('Erreur lors de l\'attribution des Permission Set Licenses : ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static string createContact(String civilite, String firstName, String lastName, String email, Id userId, Id accountId) {
        try {
            // Créer un nouveau contact avec les informations fournies
            Contact newContact = new Contact(
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                AccountId = accountId, // Utiliser l'ID de l'agence sélectionnée
                InwiB2C_Civilit__c = civilite,
                inwiCGC_UserCGC__c = userId 
            );

            // Insérer le nouveau contact dans Salesforce
            insert newContact;
             // Retourner l'ID du Contact créé
            return newContact.Id ;
        } catch (Exception e) {
            // Retourner un message d'erreur en cas d'échec
            throw new AuraHandledException('Erreur lors de la création du contact : ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateAccountContactRelation(String contactId, String accountId, String newRole) {
        try {
            // Rechercher la relation AccountContactRelation existante
            AccountContactRelation acr = [
                SELECT Id, Roles 
                FROM AccountContactRelation 
                WHERE ContactId = :contactId AND AccountId = :accountId
                LIMIT 1
            ];

            // Mettre à jour le rôle de la relation
            acr.Roles = newRole;
            update acr;
        } catch (QueryException qe) {
            // Gestion de l'erreur si aucune relation n'est trouvée
            throw new AuraHandledException('Aucune relation AccountContactRelation trouvée pour le contact et le compte spécifiés.');
        } catch (Exception e) {
            // Gestion des erreurs générales
            throw new AuraHandledException('Erreur lors de la mise à jour de la relation AccountContactRelation : ' + e.getMessage());
        }
    } 

    // recherche le nom de la queue depuis l'agence 
    @AuraEnabled
    public static String getAgenceQueueName(Id agenceId) {
        try {
            // Récupérer le nom de la file d'attente depuis l'agence en utilisant SOQL
            Account agence = [SELECT InwiB2C_Queue__c FROM Account WHERE Id = :agenceId LIMIT 1];
            if (agence == null) {
                throw new AuraHandledException('Aucune agence trouvée pour l\'ID spécifié.');
            }
            String queueName = agence.InwiB2C_Queue__c;
            if (String.isBlank(queueName)) {
                throw new AuraHandledException('Aucun nom de file d\'attente trouvé pour l\'agence spécifiée.');
            }
            return queueName;
        } catch (QueryException e) {
            throw new AuraHandledException('Erreur lors de la récupération du nom de la file d\'attente depuis l\'agence : ' + e.getMessage());
        }
    }

    // ajout user dans la queue 
    @AuraEnabled
    public static void addUserToQueue(String userId, String queueName) {
        try {
            // Vérifier si la file d'attente existe
            Group queue = [SELECT Id FROM Group WHERE DeveloperName = :queueName AND Type = 'Queue' LIMIT 1];
            if (queue != null) {
                // Ajouter l'utilisateur à la file d'attente
                GroupMember queueMember = new GroupMember(
                    GroupId = queue.Id,
                    UserOrGroupId = userId
                );
                insert queueMember;
            } else {
                throw new AuraHandledException('File d\'attente non trouvée avec le nom : ' + queueName);
            }
        } catch (Exception e) {
            throw new AuraHandledException('Erreur lors de l\'ajout de l\'utilisateur à la file d\'attente : ' + e.getMessage());
        }
    }

  }  
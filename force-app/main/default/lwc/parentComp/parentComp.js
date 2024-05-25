// Importation des modules nécessaires
import { LightningElement, track } from 'lwc'; // Importation de LightningElement et track de LWC
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; // Importation de ShowToastEvent pour afficher des notifications
import createUser from '@salesforce/apex/UserController.createUser'; // Importation de la méthode Apex createUser
import assignPermissionSets from '@salesforce/apex/UserController.assignPermissionSets'; // Importation de la méthode Apex assignPermissionSets
import assignPermissionSetLicenses from '@salesforce/apex/UserController.assignPermissionSetLicenses'; // Importation de la méthode Apex assignPermissionSetLicenses
import createContact from '@salesforce/apex/UserController.createContact'; // Importation de la méthode Apex createContact
import updateAccountContactRelation from '@salesforce/apex/UserController.updateAccountContactRelation'; // Importation de la méthode Apex updateAccountContactRelation
import addUserToQueue from '@salesforce/apex/UserController.addUserToQueue'; // Importation de la méthode Apex addUserToQueue
import getAgenceQueueName from '@salesforce/apex/UserController.getAgenceQueueName'   // Importation de la méthode Apex getAgenceQueueName

// Définition du composant ParentComponent
export default class ParentComponent extends LightningElement {
    @track selectedType = ''; // Type d'utilisateur sélectionné
    @track distributorId = ''; // ID du distributeur sélectionné
    @track showHelloWorld = true; // Affichage de la section HelloWorld 
    @track showDistributeur = false; // Affichage de la section Distributeur
    @track showSection3 = false; // Affichage de la section 3
    @track helloWorldValidated = false; // Validation de la section HelloWorld
    @track distributeurValidated = false; // Validation de la section Distributeur
    @track Error = ''; // Message d'erreur
    @track agenceId; // ID de l'agence sélectionnée
    @track agenceName; // Nom de l'agence sélectionnée
    @track nom = ''; // Nom de l'utilisateur
    @track prenom = ''; // Prénom de l'utilisateur
    @track civilite = ''; // Civilité de l'utilisateur
    @track email = ''; // Email de l'utilisateur
    @track username = ''; // Nom d'utilisateur
    @track produit = ''; // Produit sélectionné

    // Méthode pour gérer le changement de type d'utilisateur
    handleTypeChange(event) {
        this.selectedType = event.detail; // Récupère le type d'utilisateur sélectionné
        console.log('Selected Type in handleTypeChange:', this.selectedType); // Affiche le type sélectionné dans la console
    }

    // Méthode pour gérer la mise à jour de la recherche du distributeur
    lookupUpdatehandler(event) {
        const detail = event.detail;
        this.distributorId = detail ? detail : ''; // Met à jour l'ID du distributeur ou vide si non sélectionné
        this.Error = ''; // Réinitialise le message d'erreur
        console.log('distributeur in lookupUpdatehandler:', this.distributorId); // Affiche l'ID du distributeur dans la console
    }

    // Méthode pour gérer la mise à jour de la recherche de l'agence
    lookupUpdatehandlerAgence(event) {
        const detail = event.detail;
        this.agenceId = detail ? detail : ''; // Met à jour l'ID de l'agence ou vide si non sélectionné
        console.log('Agence in handleTypeChange:', this.agenceId); // Affiche l'ID de l'agence dans la console
    }

    // Méthode pour annuler l'opération
    handleCancel() {
        this.showForm = false; // Masque le formulaire
    }

    // Méthode pour sauvegarder les données
    handleSave() {
        const typeUserComponent = this.template.querySelector('c-type-user');
        if (!typeUserComponent.validate()) { // Valide le composant typeUser
            this.showToast('Error', 'Veuillez sélectionner le type d\'utilisateur.', 'error'); // Affiche un message d'erreur si non valide
            return; // Sort de la méthode
        }

        // Vérifie si tous les champs obligatoires sont remplis
        if (!this.selectedType || !this.nom || !this.prenom || !this.civilite || !this.email || !this.username || !this.produit || !this.agenceId) {
            this.showToast('Error', 'Veuillez remplir tous les champs obligatoires.', 'error'); // Affiche un message d'erreur si des champs sont vides
            this.showError = true; // Affiche le message d'erreur
            return; // Sort de la méthode
        }

        this.showForm = false; // Masque le formulaire après avoir sauvegardé
        this.showToast('Info', `Selected Type: ${this.selectedType}`, 'info'); // Affiche un message d'information
        console.log('Selected Type in handleSave:', this.selectedType); // Affiche le type sélectionné dans la console
        let userId; // Déclaration de userId pour qu'il soit accessible dans toute la méthode handleSave
        let contactId; // Déclaration de contactId pour qu'il soit accessible dans toute la méthode handleSave

        // Si le type sélectionné est 'Livreur' ou 'Animateur'
        if (this.selectedType === 'Livreur' || this.selectedType === 'Animateur') {
            // Appeler la méthode Apex pour créer un nouvel utilisateur
            createUser({ 
                username: this.username,
                firstName: this.nom,
                lastName: this.prenom,
                email: this.email,
                profileName: 'End User',
                contactId: null 
            })
            .then(result => {
                this.showToast('Success', 'User created successfully', 'success'); // Affiche un message de succès
                userId = result; // Capturer l'ID de l'utilisateur créé

                // Définir les Permission Sets de base
                let permSetNames = ['LightningRetailExecutionStarter', 'MapsUser'];
                if (this.selectedType === 'Livreur') {
                    permSetNames.push('ActionPlans'); // Ajouter des Permission Sets spécifiques pour 'Livreur'
                }
                if (this.selectedType === 'Animateur' && this.produit === 'ADSL') {
                    permSetNames.push('ADSL'); // Ajouter des Permission Sets spécifiques pour 'Animateur' et 'ADSL'
                } else if (this.selectedType === 'Animateur' && this.produit === 'FTTH') {
                    permSetNames.push('FTTH'); // Ajouter des Permission Sets spécifiques pour 'Animateur' et 'FTTH'
                }

                return assignPermissionSets({ permSetNames: permSetNames, userId: userId }); // Appel de la méthode pour attribuer les Permission Sets
            })
            .then(() => {
                this.showToast('Success', 'Permission sets assigned successfully', 'success'); // Affiche un message de succès pour les Permission Sets
                let permSetLicenseNames = ['SFMaps_Maps_LiveMobileTracking', 'IndustriesVisitPsl', 'SFMaps_Maps_Advanced', 'LightningRetailExecutionStarterPsl'];
                return assignPermissionSetLicenses({ permSetLicenseNames: permSetLicenseNames, userId: userId }); // Appel de la méthode pour attribuer les Permission Set Licenses
            })
            .then(() => {
                this.showToast('Success', 'Permission set licenses assigned successfully', 'success'); // Affiche un message de succès pour les Permission Set Licenses
                return createContact({
                    civilite: this.civilite,
                    firstName: this.nom,
                    lastName: this.prenom,
                    email: this.email,
                    userId: userId,
                    accountId: this.agenceId,
                    inwiCGC_UserCGC__c: userId
                }); // Appel de la méthode pour créer un contact
            })
            .then(result => {
                contactId = result; // Capturer l'ID du contact créé
                this.showToast('Success', 'Contact created successfully', 'success'); // Affiche un message de succès pour la création de contact
                if (this.selectedType === 'Livreur') {
                    return updateAccountContactRelation({
                        contactId: contactId,
                        accountId: this.agenceId,
                        role: 'inwiB2C_ChefEquipe'
                    }); // Si le type est 'Livreur', créer la relation AccountContactRelation
                }
            })
            .then(() => {
                this.showToast('Success', 'Account-Contact relation created successfully', 'success'); // Affiche un message de succès pour la relation Account-Contact
            })
            .catch(error => {
                this.showToast('Error', 'Erreur lors de la création de l\'utilisateur ou de l\'attribution des permissions : ' + (error.body ? error.body.message : error.message), 'error'); // Affiche un message d'erreur en cas d'échec
                console.error('Erreur lors de la création de l\'utilisateur ou de l\'attribution des permissions : ', error); // Affiche l'erreur dans la console
            });
        } else if (this.selectedType === 'Utilisateur BO') {
            createContact({
                civilite: this.civilite,
                firstName: this.nom,
                lastName: this.prenom,
                email: this.email,
            }).then(result => {
                // Code pour gérer la création de 'Utilisateur BO' (back-office) si nécessaire
            });
        }
    }

    // Méthode pour afficher les messages toast
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt); // Envoie l'événement pour afficher le message toast
    }

    // Méthodes pour mettre à jour les champs en fonction des événements
    handleNomUpdate(event) {
        this.nom = event.detail; // Met à jour le nom
    }

    handlePrenomUpdate(event) {
        this.prenom = event.detail; // Met à jour le prénom
    }

    handleCiviliteUpdate(event) {
        this.civilite = event.detail; // Met à jour la civilité
    }

    handleEmailUpdate(event) {
        this.email = event.detail; // Met à jour l'email
    }

    handleUsernameUpdate(event) {
        this.username = event.detail; // Met à jour le nom d'utilisateur
    }

    handleProduitUpdate(event) {
        this.produit = event.detail; // Met à jour le produit
    }
}
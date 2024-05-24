
import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createUser from '@salesforce/apex/UserController.createUser';
import assignPermissionSets from '@salesforce/apex/UserController.assignPermissionSets';
import assignPermissionSetLicenses from '@salesforce/apex/UserController.assignPermissionSetLicenses';
import createContact from '@salesforce/apex/UserController.createContact';
import updateAccountContactRelation from '@salesforce/apex/UserController.updateAccountContactRelation';
import addUserToQueue from '@salesforce/apex/UserController.addUserToQueue' ; 
import getAgenceQueueName from '@salesforce/apex/UserController.getAgenceQueueName' ; 



export default class ParentComponent extends LightningElement {
    @track selectedType = '';
    @track distributorId = '';
    @track showHelloWorld = true;
    @track showDistributeur = false;
    @track showSection3 = false;
    @track helloWorldValidated = false;
    @track distributeurValidated = false;
    @track Error = '';
    @track agenceId;
    @track agenceName;
    @track nom = '';
    @track prenom = '';
    @track civilite = '';
    @track email = '';
    @track username = '';
    @track produit = '';

    handleTypeChange(event) {
        this.selectedType = event.detail; // Récupère le type d'utilisateur sélectionné
        console.log('Selected Type in handleTypeChange:', this.selectedType);
    }

    lookupUpdatehandler(event) {
        const detail = event.detail;
        this.distributorId = detail ? detail : ''; // Set to empty string if distributor is removed
        this.Error = '';
        console.log('distributeur in lookupUpdatehandler:', this.distributorId);
    }

    lookupUpdatehandlerAgence(event) {
        const detail = event.detail ;
        this.agenceId = detail ? detail : '';
        console.log('Agence in handleTypeChange:', this.agenceId);
    }

    handleCancel() {
        this.showForm = false; // On ajoutera une logique pour revenir à la page de création ou autre
    }

    handleSave() {
        // Vérifier si tous les champs sont remplis
        if (!this.nom || !this.prenom || !this.civilite || !this.email || !this.username || !this.produit) {
        // Afficher un message d'erreur si un champ est manquant

        this.showToast('Error', 'Veuillez remplir tous les champs.', 'error');

        return;        
    }


        this.showForm = false; // Masquer le formulaire après avoir sauvegardé
        this.showToast('Info', `Selected Type: ${this.selectedType}`, 'info');
        console.log('Selected Type in handleSave:', this.selectedType); 
        let userId; // Déclaration de userId pour qu'il soit accessible dans toute la méthode handleSave
        let contactId; 
    
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
                // Affichez un message de succès à l'utilisateur
                this.showToast('Success', 'User created successfully', 'success');
                
                // Capturer l'ID de l'utilisateur créé
                userId = result; 
    
                // Définir les Permission Sets de base
                let permSetNames = ['LightningRetailExecutionStarter', 'MapsUser'];
                console.log('Selected Type in then:', this.selectedType); 
                
                // Ajouter des Permission Sets spécifiques si le type est 'livreur'
                if (this.selectedType === 'Livreur') {
                    permSetNames.push('ActionPlans');
                }
                // Ajouter des Permission Sets spécifiques si le type est 'Animateur' et le produit est 'adsl' ou 'ftth'
             if (this.selectedType === 'Animateur' && this.produit === 'ADSL') {
                permSetNames.push('ADSL');
             } else if (this.selectedType === 'Animateur' && this.produit === 'FTTH') {
                permSetNames.push('FTTH');
              }
    
                // Appel de la méthode pour attribuer les Permission Sets
                return assignPermissionSets({ permSetNames: permSetNames, userId: userId });
            })
            .then(() => {
                // Affichez un message de succès pour l'attribution des Permission Sets
                this.showToast('Success', 'Permission sets assigned successfully', 'success');
    
                // Définir les Permission Set Licenses de base
                let permSetLicenseNames = ['SFMaps_Maps_LiveMobileTracking', 'IndustriesVisitPsl', 'SFMaps_Maps_Advanced', 'LightningRetailExecutionStarterPsl'];
    
                // Appel de la méthode pour attribuer les Permission Set Licenses
                return assignPermissionSetLicenses({ permSetLicenseNames: permSetLicenseNames, userId: userId });
            })
            .then(() => {
                // Affichez un message de succès pour l'attribution des Permission Set Licenses
                this.showToast('Success', 'Permission set licenses assigned successfully', 'success');
                
                // Appeler la méthode Apex pour créer un nouveau contact
                return createContact({
                    civilite: this.civilite,
                    firstName: this.nom,
                    lastName: this.prenom,
                    email: this.email,
                    userId: userId,
                    accountId: this.agenceId,
                    inwiCGC_UserCGC__c: userId
                });
            })
            .then(result => {
                // Capturer l'ID du contact créé
                contactId = result;
                this.showToast('Success', 'Contact created successfully', 'success');
                console.log('Contact created with ID:', contactId);
    
                // Si le type sélectionné est 'Livreur', créer la relation AccountContactRelation
                if (this.selectedType === 'Livreur') {
                    console.log('Selected type is Livreur, creating AccountContactRelation');
                    return updateAccountContactRelation({
                        contactId: contactId,
                        accountId: this.agenceId,
                        role: 'inwiB2C_ChefEquipe'
                    })
                    .then(() => {
                        // Affichez un message de succès pour la création de la relation AccountContactRelation
                        this.showToast('Success', 'Account-Contact relation created successfully', 'success');
                    });
                }
            })
            .catch(error => {
                // Affichez un message d'erreur à l'utilisateur
                this.showToast('Error', 'Erreur lors de la création de l\'utilisateur ou de l\'attribution des permissions : ' + (error.body ? error.body.message : error.message), 'error');
                console.error('Erreur lors de la création de l\'utilisateur ou de l\'attribution des permissions : ', error);
            });
        } else  if (this.selectedType === 'Utilisateur BO') {
            createContact({
                civilite: this.civilite,
                firstName: this.nom,
                lastName: this.prenom,
                email: this.email,
                userId: userId,
                accountId: this.agenceId,
                inwiCGC_UserCGC__c: null
            })
            .then(result => {
                // Capturer l'ID du contact créé
                contactId = result;
                this.showToast('Success', 'Contact for Utilisateur BO created successfully', 'success');
                console.log('Contact created with ID:', contactId);

                // Créer l'utilisateur Salesforce avec le profil "BO Distributeur"
                return createUser({
                    username: this.username,
                    firstName: this.nom,
                    lastName: this.prenom,
                    email: this.email,
                    profileName: 'BO Distributeur',
                    contactId: contactId 
                });
            })
            .then(result => {
                userId = result ;
                // Fetch Queue Name from Agence
                return getAgenceQueueName({ agenceId: this.agenceId });
            })
            .then(queueName => {
                if (queueName) {
                    // Add User to Queue
                    return addUserToQueue({
                        userId: userId,
                        queueName: queueName
                    });
                } else {
                    throw new Error('Aucun nom de file d\'attente trouvé pour l\'agence spécifiée.');
                }
            })
            .then(() => {
                this.showToast('Success', 'User for Utilisateur BO created successfully and added to Queue', 'success');
                console.log('User created for Utilisateur BO and added to Queue');
            })
            .catch(error => {
                this.showToast('Error', 'Erreur lors de la création du contact ou de l\'ajout à la file d\'attente : ' + (error.body ? error.body.message : error.message), 'error');
                console.error('Erreur lors de la création du contact ou de l\'ajout à la file d\'attente : ', error);
            });
        } else {
            
        }
        
    }
    

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    handleNomUpdate(event) {
        this.nom = event.detail;
    }

    handlePrenomUpdate(event) {
        this.prenom = event.detail;
    }

    handleCiviliteUpdate(event) {
        this.civilite = event.detail;
    }

    handleEmailUpdate(event) {
        this.email = event.detail;
    }

    handleUsernameUpdate(event) {
        this.username = event.detail;
    }

    handleProduitUpdate(event) {
        this.produit = event.detail;
    }
}

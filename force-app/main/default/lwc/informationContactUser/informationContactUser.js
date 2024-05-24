import { LightningElement, track, api } from 'lwc';

export default class InformationContactUser extends LightningElement {
    @api selectedType = '';

    @track nom = '';
    @track prenom = '';
    @track civilite = '';
    @track email = '';
    @track username = '';
    @track selectedProduits = [];
    @track afficherProduit = false;

    // Définir les options pour la civilité
    get civiliteOptions() {
        return [
            { label: 'M', value: 'M' },
            { label: 'Mlle', value: 'Mlle' },
            { label: 'Mr', value: 'Mr' }
        ];
    }

    // Définir les options pour le champ produit
    get produitOptions() {
        return [
            { label: 'FTTH', value: 'FTTH' },
            { label: 'ADSL', value: 'ADSL' }
        ];
    }

    handleCiviliteChange(event) {
        this.civilite = event.target.value;
        this.dispatchUpdateEvent('civilite', this.civilite);
    }

    handleNomChange(event) {
        this.nom = event.target.value;
        this.dispatchUpdateEvent('nom', this.nom);
    }

    handlePrenomChange(event) {
        this.prenom = event.target.value;
        this.dispatchUpdateEvent('prenom', this.prenom);
    }

    handleEmailChange(event) {
        this.email = event.target.value;
        this.dispatchUpdateEvent('email', this.email);
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
        this.dispatchUpdateEvent('username', this.username);
    }

    handleProduitsChange(event) {
        this.selectedProduits = event.detail.value;
        this.dispatchUpdateEvent('selectedProduits', this.selectedProduits);
    }

   dispatchUpdateEvent(fieldName, value) {
        const updateEvent = new CustomEvent(`${fieldName}update`, {
            detail: value
        });
        this.dispatchEvent(updateEvent);
    }

     get showProduitField() {
        return this.selectedType === 'Animateur' || this.selectedType;
    }
}
 









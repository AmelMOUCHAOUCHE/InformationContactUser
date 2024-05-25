import { LightningElement, track } from 'lwc';

export default class TypeUser extends LightningElement {
    @track selectedType = '';

    get options() {
        return [
            { label: 'Utilisateur BO', value: 'Utilisateur BO' },
            { label: 'Animateur', value: 'Animateur' },
            { label: 'Livreur', value: 'Livreur' }
        ];
    }

    handleTypeChange(event) {
        this.selectedType = event.target.value;
        const selectEvent = new CustomEvent('typechange', { detail: this.selectedType });
        this.dispatchEvent(selectEvent);
        console.log('UserType:', this.selectedType);
    }

    // Vérifier si le champ type user est sélectionné
    validate() {
        const combobox = this.template.querySelector('lightning-combobox');
        if (!this.selectedType) {
            combobox.setCustomValidity("Le champ type user est obligatoire");
        } else {
            combobox.setCustomValidity("");
        }
        combobox.reportValidity();
        return !!this.selectedType;
    }
}
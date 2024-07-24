import type { Metadata } from 'next'
import AccountSettingsWrapper from '../components/accountSettingsWrapper';
import AccountSettingsMenu from '../components/accountSettingsMenu';
import './accountSettingsMenuStyle.css'

export const metadata: Metadata = {
	title: 'Moja stranica',
	description: 'Strania s osnovnim korisničkim akcijama',
}

async function ManageMyAccount() {
	return (
    <main className='accountPageMain formMain'>
			<AccountSettingsWrapper>
        <AccountSettingsMenu/>
      </AccountSettingsWrapper>
    </main>
    )
}
export default ManageMyAccount;
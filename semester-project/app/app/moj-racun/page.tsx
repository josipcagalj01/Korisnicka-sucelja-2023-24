import type { Metadata } from 'next'
import AccountSettingsWrapper from '../components/accountSettingsWrapper';
import AccountSettingsMenu from '../components/accountSettingsMenu';
import './accountSettingsMenuStyle.css'

export const metadata: Metadata = {
	title: 'Moj račun',
	description: 'Promjena postavki korisničkog računa',
}

function ManageMyAccount() {

	return (
    <main className='accountPageMain'>
			<AccountSettingsWrapper>
        <AccountSettingsMenu/>
      </AccountSettingsWrapper>
    </main>
    )
}
export default ManageMyAccount;
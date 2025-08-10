import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';

// Custom translations for our app components
const customTranslations = {
  en: {
    // Menu items
    'menu.filters': 'Filters',
    'menu.settings': 'Settings',
    'menu.inviteFriends': 'Invite Friends',
    
    // Filters
    'filters.title': 'Select News Filters',
    'filters.industries': 'Industries',
    'filters.countries': 'Countries',
    'filters.allIndustries': 'All Industries',
    'filters.allCountries': 'All Countries',
    'filters.applyFilters': 'Apply Filters',
    'filters.legend': 'Articles that match BOTH the selected industries AND countries will be shown.',
    'filters.legendIndustriesOnly': 'All articles that match ANY of the selected industries will be shown.',
    'filters.legendCountriesOnly': 'All articles that match ANY of the selected countries will be shown.',
    'filters.legendAllCountries': 'All articles that match ANY of the selected industries will be shown (all countries included).',
    'filters.legendNoFilters': 'No filters are selected. ALL articles will be shown.',
    
    // Settings
    'settings.title': 'Settings',
    'settings.changePassword': 'Change Password',
    'settings.changePasswordDesc': 'Update your account password',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteAccountDesc': 'Permanently delete your account and all data',
    'settings.inviteFriends': 'Invite Friends',
    'settings.inviteFriendsDesc': 'Share your referral code and earn free months',
    'settings.backToNews': '← Back to News Feed',
    'settings.backToSettings': '← Back to Settings',
    
    // Welcome
    'welcome.title': 'Welcome to Perkins News',
    'welcome.subtitle': 'To get started, personalize your news feed by selecting the industries and countries that matter most to you.',
    'welcome.button': 'Personalize Your Feed',
    'welcome.hint': 'You can always change these settings later from the main menu.',
    
    // Common
    'common.loading': 'Loading...',
    'common.noArticles': 'No articles match your current filters.',
    'common.waitingForNews': '🕓 Waiting for news...',
    'common.loadingPreferences': 'Loading preferences...',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    
    // Referral
    'referral.title': '🎁 Invite Friends & Earn Free Months',
    'referral.subtitle': 'Share your referral code with friends and get 3 additional months of free access for each successful referral!',
    'referral.loading': 'Loading referral information...',
    'referral.yourCode': 'Your Referral Code',
    'referral.copyCode': 'Copy',
    'referral.copied': 'Copied!',
    'referral.shareCodeHint': 'Share this code with friends to earn free months',
    'referral.shareTitle': 'Share Your Referral Link',
    'referral.whatsapp': '📱 WhatsApp',
    'referral.email': '📧 Email',
    'referral.copyLink': '📋 Copy Link',
    'referral.statsTitle': 'Your Referral Stats',
    'referral.successfulReferrals': 'Successful Referrals',
    'referral.monthsEarned': 'Months Earned',
    'referral.totalReferrals': 'Total Referrals',
    'referral.howItWorks': 'How It Works',
    'referral.step1': 'Share your referral code with friends via WhatsApp, email, or copy the link',
    'referral.step2': 'When they sign up using your code, they get 3 months of free access',
    'referral.step3': 'You earn 3 additional months of free access for each successful referral',
    'referral.step4': 'Track your progress and earnings in the stats above',
    'referral.refreshStats': 'Refresh Stats',
    'referral.refreshing': 'Refreshing...',
    'referral.linkCopied': 'Referral link copied to clipboard!',
    'referral.openingWhatsApp': 'Opening WhatsApp...',
    'referral.openingEmail': 'Opening email client...',
    'referral.shareMessage': 'Join Perkins News Service and get 3 months free! Use my referral code: {code}',
    'referral.emailSubject': 'Join Perkins News Service - 3 Months Free!',
    'referral.emailBody': 'Hi!\n\nI\'m using Perkins News Service and thought you might be interested. It\'s a great way to stay updated with business news.\n\nYou can get 3 months of free access using my referral code: {code}\n\nSign up here: {url}\n\nBest regards!',
    
    // Password
    'password.title': 'Change Password',
    'password.currentPassword': 'Current Password',
    'password.newPassword': 'New Password',
    'password.confirmNewPassword': 'Confirm New Password',
    'password.updatePassword': 'Change Password',
    'password.passwordUpdated': 'Password changed successfully!',
    'password.passwordsDontMatch': 'New passwords do not match',
    'password.requirements': 'Password requirements:',
    'password.requirementsText': 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
    'password.changing': 'Changing password...',
    'password.enterCurrentPassword': 'Enter your current password',
    'password.enterNewPassword': 'Enter your new password',
    'password.confirmNewPasswordPlaceholder': 'Confirm your new password',
    'password.failedToChange': 'Failed to change password',
    'password.unexpectedError': 'An unexpected error occurred while changing password',
    
    // Delete Account
    'deleteAccount.title': 'Delete Account',
    'deleteAccount.warning': 'This action cannot be undone. All your data, preferences, and account information will be permanently deleted.',
    'deleteAccount.confirmDelete': 'Delete Account',
    'deleteAccount.accountDeleted': 'Account deleted successfully. You will be redirected to the login page.',
    'deleteAccount.enterPassword': 'Please enter your password to confirm account deletion',
    'deleteAccount.confirmPassword': 'Confirm Password',
    'deleteAccount.enterPasswordToConfirm': 'Enter your password to confirm',
    'deleteAccount.deleting': 'Deleting account...',
    'deleteAccount.failedToDelete': 'Failed to delete account',
    'deleteAccount.unexpectedError': 'An unexpected error occurred while deleting account',
    'deleteAccount.loseAccess': 'By deleting your account, you will lose access to all your personalized news feeds, preferences, and referral benefits.',
    
    // Sign Up
    'signup.title': 'Join Perkins News Service',
    'signup.subtitle': 'Get 3 months of free access to personalized business news',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.referralCode': 'Referral Code (Optional)',
    'signup.enterEmail': 'Enter your email',
    'signup.createPassword': 'Create a password',
    'signup.confirmPasswordPlaceholder': 'Confirm your password',
    'signup.enterReferralCode': 'Enter referral code if you have one',
    'signup.createAccount': 'Create Account',
    'signup.creatingAccount': 'Creating account...',
    'signup.accountCreated': 'Account created successfully! Please check your email to verify your account.',
    'signup.validEmail': 'Please enter a valid email address',
    'signup.passwordsDontMatch': 'Passwords do not match',
    'signup.validReferralCode': '✅ Valid referral code! You\'ll get 3 months of free access.',
    'signup.invalidReferralCode': '❌ Invalid referral code. You can still sign up for 3 months free.',
    'signup.errorValidatingCode': '❌ Error validating referral code.',
    'signup.termsAgreement': 'By creating an account, you agree to our Terms of Service and Privacy Policy',
    'signup.errorDuringSignup': 'An error occurred during sign up',
    'signup.unexpectedError': 'An unexpected error occurred during sign up',
    'signup.invalidUserAttributes': 'Invalid user attributes',
    
    // Inactivity Warning
    'inactivity.title': 'Inactivity Warning',
    'inactivity.message': 'For your security, you will be logged out in less than {minutes} minute(s). Do you want to stay logged in?',
    'inactivity.logout': 'Logout',
    'inactivity.stayLoggedIn': 'Stay Logged In',
    
    // Auth Error
    'authError.title': 'Authentication Error',
    'authError.message': 'There was an issue with your authentication. Please try again or log out and sign back in.',
    'authError.technicalDetails': 'Technical Details',
    'authError.tryAgain': 'Try Again',
    'authError.logout': 'Logout',
    
    // User Settings
    'userSettings.title': 'Settings',
    'userSettings.changePassword': 'Change Password',
    'userSettings.changePasswordDesc': 'Update your account password',
    'userSettings.deleteAccount': 'Delete Account',
    'userSettings.deleteAccountDesc': 'Permanently delete your account and all data',
    'userSettings.inviteFriends': 'Invite Friends',
    'userSettings.inviteFriendsDesc': 'Share your referral code and earn free months',
    
    // Disclaimer
    'disclaimer.text': 'News may be delayed by several minutes depending on source publication and retrieval frequency.',
  },
  es: {
    // Menu items
    'menu.filters': 'Filtros',
    'menu.settings': 'Configuración',
    'menu.inviteFriends': 'Invitar Amigos',
    
    // Filters
    'filters.title': 'Seleccionar Filtros de Noticias',
    'filters.industries': 'Industrias',
    'filters.countries': 'Países',
    'filters.allIndustries': 'Todas las Industrias',
    'filters.allCountries': 'Todos los Países',
    'filters.applyFilters': 'Aplicar Filtros',
    'filters.legend': 'Se mostrarán artículos que coincidan con AMBAS industrias Y países seleccionados.',
    'filters.legendIndustriesOnly': 'Se mostrarán todos los artículos que coincidan con CUALQUIERA de las industrias seleccionadas.',
    'filters.legendCountriesOnly': 'Se mostrarán todos los artículos que coincidan con CUALQUIERA de los países seleccionados.',
    'filters.legendAllCountries': 'Se mostrarán todos los artículos que coincidan con CUALQUIERA de las industrias seleccionadas (todos los países incluidos).',
    'filters.legendNoFilters': 'No hay filtros seleccionados. Se mostrarán TODOS los artículos.',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.changePassword': 'Cambiar Contraseña',
    'settings.changePasswordDesc': 'Actualizar la contraseña de tu cuenta',
    'settings.deleteAccount': 'Eliminar Cuenta',
    'settings.deleteAccountDesc': 'Eliminar permanentemente tu cuenta y todos los datos',
    'settings.inviteFriends': 'Invitar Amigos',
    'settings.inviteFriendsDesc': 'Comparte tu código de referido y gana meses gratis',
    'settings.backToNews': '← Volver al Feed de Noticias',
    'settings.backToSettings': '← Volver a Configuración',
    
    // Welcome
    'welcome.title': 'Bienvenido a Perkins News',
    'welcome.subtitle': 'Para comenzar, personaliza tu feed de noticias seleccionando las industrias y países que más te importan.',
    'welcome.button': 'Personalizar tu Feed',
    'welcome.hint': 'Siempre puedes cambiar esta configuración más tarde desde el menú principal.',
    
    // Common
    'common.loading': 'Cargando...',
    'common.noArticles': 'No hay artículos que coincidan con tus filtros actuales.',
    'common.waitingForNews': '🕓 Esperando noticias...',
    'common.loadingPreferences': 'Cargando preferencias...',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    
    // Referral
    'referral.title': '🎁 Invitar Amigos y Ganar Meses Gratis',
    'referral.subtitle': '¡Comparte tu código de referido con amigos y obtén 3 meses adicionales de acceso gratis por cada referido exitoso!',
    'referral.loading': 'Cargando información de referidos...',
    'referral.yourCode': 'Tu Código de Referido',
    'referral.copyCode': 'Copiar',
    'referral.copied': '¡Copiado!',
    'referral.shareCodeHint': 'Comparte este código con amigos para ganar meses gratis',
    'referral.shareTitle': 'Compartir tu Enlace de Referido',
    'referral.whatsapp': '📱 WhatsApp',
    'referral.email': '📧 Email',
    'referral.copyLink': '📋 Copiar Enlace',
    'referral.statsTitle': 'Tus Estadísticas de Referidos',
    'referral.successfulReferrals': 'Referidos Exitosos',
    'referral.monthsEarned': 'Meses Ganados',
    'referral.totalReferrals': 'Total de Referidos',
    'referral.howItWorks': 'Cómo Funciona',
    'referral.step1': 'Comparte tu código de referido con amigos via WhatsApp, email, o copia el enlace',
    'referral.step2': 'Cuando se registren usando tu código, obtienen 3 meses de acceso gratis',
    'referral.step3': 'Tú ganas 3 meses adicionales de acceso gratis por cada referido exitoso',
    'referral.step4': 'Rastrea tu progreso y ganancias en las estadísticas arriba',
    'referral.refreshStats': 'Actualizar Estadísticas',
    'referral.refreshing': 'Actualizando...',
    'referral.linkCopied': '¡Enlace de referido copiado al portapapeles!',
    'referral.openingWhatsApp': 'Abriendo WhatsApp...',
    'referral.openingEmail': 'Abriendo cliente de email...',
    'referral.shareMessage': '¡Únete al Servicio de Noticias Perkins y obtén 3 meses gratis! Usa mi código de referido: {code}',
    'referral.emailSubject': '¡Únete al Servicio de Noticias Perkins - 3 Meses Gratis!',
    'referral.emailBody': '¡Hola!\n\nEstoy usando el Servicio de Noticias Perkins y pensé que te podría interesar. Es una excelente manera de mantenerse actualizado con noticias de negocios.\n\nPuedes obtener 3 meses de acceso gratis usando mi código de referido: {code}\n\nRegístrate aquí: {url}\n\n¡Saludos!',
    
    // Password
    'password.title': 'Cambiar Contraseña',
    'password.currentPassword': 'Contraseña Actual',
    'password.newPassword': 'Nueva Contraseña',
    'password.confirmNewPassword': 'Confirmar Nueva Contraseña',
    'password.updatePassword': 'Cambiar Contraseña',
    'password.passwordUpdated': '¡Contraseña actualizada exitosamente!',
    'password.passwordsDontMatch': 'Las nuevas contraseñas no coinciden',
    'password.requirements': 'Requisitos de contraseña:',
    'password.requirementsText': 'La contraseña debe tener al menos 8 caracteres y contener mayúsculas, minúsculas, números y caracteres especiales.',
    'password.changing': 'Cambiando contraseña...',
    'password.enterCurrentPassword': 'Ingresa tu contraseña actual',
    'password.enterNewPassword': 'Ingresa tu nueva contraseña',
    'password.confirmNewPasswordPlaceholder': 'Confirma tu nueva contraseña',
    'password.failedToChange': 'Error al cambiar la contraseña',
    'password.unexpectedError': 'Ocurrió un error inesperado al cambiar la contraseña',
    
    // Delete Account
    'deleteAccount.title': 'Eliminar Cuenta',
    'deleteAccount.warning': 'Esta acción no se puede deshacer. Todos tus datos, preferencias e información de cuenta serán eliminados permanentemente.',
    'deleteAccount.confirmDelete': 'Eliminar Cuenta',
    'deleteAccount.accountDeleted': 'Cuenta eliminada exitosamente. Serás redirigido a la página de inicio de sesión.',
    'deleteAccount.enterPassword': 'Por favor ingresa tu contraseña para confirmar la eliminación de la cuenta',
    'deleteAccount.confirmPassword': 'Confirmar Contraseña',
    'deleteAccount.enterPasswordToConfirm': 'Ingresa tu contraseña para confirmar',
    'deleteAccount.deleting': 'Eliminando cuenta...',
    'deleteAccount.failedToDelete': 'Error al eliminar la cuenta',
    'deleteAccount.unexpectedError': 'Ocurrió un error inesperado al eliminar la cuenta',
    'deleteAccount.loseAccess': 'Al eliminar tu cuenta, perderás acceso a todos tus feeds de noticias personalizados, preferencias y beneficios de referidos.',
    
    // Sign Up
    'signup.title': 'Únete al Servicio de Noticias Perkins',
    'signup.subtitle': 'Obtén 3 meses de acceso gratis a noticias de negocios personalizadas',
    'signup.email': 'Email',
    'signup.password': 'Contraseña',
    'signup.confirmPassword': 'Confirmar Contraseña',
    'signup.referralCode': 'Código de Referido (Opcional)',
    'signup.enterEmail': 'Ingresa tu email',
    'signup.createPassword': 'Crea una contraseña',
    'signup.confirmPasswordPlaceholder': 'Confirma tu contraseña',
    'signup.enterReferralCode': 'Ingresa código de referido si tienes uno',
    'signup.createAccount': 'Crear Cuenta',
    'signup.creatingAccount': 'Creando cuenta...',
    'signup.accountCreated': '¡Cuenta creada exitosamente! Por favor revisa tu email para verificar tu cuenta.',
    'signup.validEmail': 'Por favor ingresa un email válido',
    'signup.passwordsDontMatch': 'Las contraseñas no coinciden',
    'signup.validReferralCode': '✅ ¡Código de referido válido! Obtendrás 3 meses de acceso gratis.',
    'signup.invalidReferralCode': '❌ Código de referido inválido. Aún puedes registrarte por 3 meses gratis.',
    'signup.errorValidatingCode': '❌ Error al validar código de referido.',
    'signup.termsAgreement': 'Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad',
    'signup.errorDuringSignup': 'Ocurrió un error durante el registro',
    'signup.unexpectedError': 'Ocurrió un error inesperado durante el registro',
    'signup.invalidUserAttributes': 'Atributos de usuario inválidos',
    
    // Inactivity Warning
    'inactivity.title': 'Advertencia de Inactividad',
    'inactivity.message': 'Por tu seguridad, serás desconectado en menos de {minutes} minuto(s). ¿Quieres mantenerte conectado?',
    'inactivity.logout': 'Cerrar Sesión',
    'inactivity.stayLoggedIn': 'Mantenerse Conectado',
    
    // Auth Error
    'authError.title': 'Error de Autenticación',
    'authError.message': 'Hubo un problema con tu autenticación. Por favor intenta de nuevo o cierra sesión y vuelve a iniciar sesión.',
    'authError.technicalDetails': 'Detalles Técnicos',
    'authError.tryAgain': 'Intentar de Nuevo',
    'authError.logout': 'Cerrar Sesión',
    
    // User Settings
    'userSettings.title': 'Configuración',
    'userSettings.changePassword': 'Cambiar Contraseña',
    'userSettings.changePasswordDesc': 'Actualizar la contraseña de tu cuenta',
    'userSettings.deleteAccount': 'Eliminar Cuenta',
    'userSettings.deleteAccountDesc': 'Eliminar permanentemente tu cuenta y todos los datos',
    'userSettings.inviteFriends': 'Invitar Amigos',
    'userSettings.inviteFriendsDesc': 'Comparte tu código de referido y gana meses gratis',
    
    // Disclaimer
    'disclaimer.text': 'Las noticias pueden retrasarse varios minutos según la publicación de la fuente y la frecuencia de actualización.',
  },
  pt: {
    // Menu items
    'menu.filters': 'Filtros',
    'menu.settings': 'Configurações',
    'menu.inviteFriends': 'Convidar Amigos',
    
    // Filters
    'filters.title': 'Selecionar Filtros de Notícias',
    'filters.industries': 'Indústrias',
    'filters.countries': 'Países',
    'filters.allIndustries': 'Todas as Indústrias',
    'filters.allCountries': 'Todos os Países',
    'filters.applyFilters': 'Aplicar Filtros',
    'filters.legend': 'Artigos que correspondem a AMBAS indústrias E países selecionados serão mostrados.',
    'filters.legendIndustriesOnly': 'Todos os artigos que correspondem a QUALQUER uma das indústrias selecionadas serão mostrados.',
    'filters.legendCountriesOnly': 'Todos os artigos que correspondem a QUALQUER um dos países selecionados serão mostrados.',
    'filters.legendAllCountries': 'Todos os artigos que correspondem a QUALQUER uma das indústrias selecionadas serão mostrados (todos os países incluídos).',
    'filters.legendNoFilters': 'Nenhum filtro selecionado. TODOS os artigos serão mostrados.',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.changePassword': 'Alterar Senha',
    'settings.changePasswordDesc': 'Atualizar a senha da sua conta',
    'settings.deleteAccount': 'Excluir Conta',
    'settings.deleteAccountDesc': 'Excluir permanentemente sua conta e todos os dados',
    'settings.inviteFriends': 'Convidar Amigos',
    'settings.inviteFriendsDesc': 'Compartilhe seu código de indicação e ganhe meses grátis',
    'settings.backToNews': '← Voltar ao Feed de Notícias',
    'settings.backToSettings': '← Voltar às Configurações',
    
    // Welcome
    'welcome.title': 'Bem-vindo ao Perkins News',
    'welcome.subtitle': 'Para começar, personalize seu feed de notícias selecionando as indústrias e países que mais importam para você.',
    'welcome.button': 'Personalizar seu Feed',
    'welcome.hint': 'Você sempre pode alterar essas configurações mais tarde no menu principal.',
    
    // Common
    'common.loading': 'Carregando...',
    'common.noArticles': 'Nenhum artigo corresponde aos seus filtros atuais.',
    'common.waitingForNews': '🕓 Aguardando notícias...',
    'common.loadingPreferences': 'Carregando preferências...',
    'common.close': 'Fechar',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    
    // Referral
    'referral.title': '🎁 Convidar Amigos e Ganhar Meses Grátis',
    'referral.subtitle': 'Compartilhe seu código de indicação com amigos e ganhe 3 meses adicionais de acesso grátis para cada indicação bem-sucedida!',
    'referral.loading': 'Carregando informações de indicação...',
    'referral.yourCode': 'Seu Código de Indicação',
    'referral.copyCode': 'Copiar',
    'referral.copied': 'Copiado!',
    'referral.shareCodeHint': 'Compartilhe este código com amigos para ganhar meses grátis',
    'referral.shareTitle': 'Compartilhar seu Link de Indicação',
    'referral.whatsapp': '📱 WhatsApp',
    'referral.email': '📧 Email',
    'referral.copyLink': '📋 Copiar Link',
    'referral.statsTitle': 'Suas Estatísticas de Indicação',
    'referral.successfulReferrals': 'Indicações Bem-sucedidas',
    'referral.monthsEarned': 'Meses Ganhos',
    'referral.totalReferrals': 'Total de Indicações',
    'referral.howItWorks': 'Como Funciona',
    'referral.step1': 'Compartilhe seu código de indicação com amigos via WhatsApp, email, ou copie o link',
    'referral.step2': 'Quando eles se registrarem usando seu código, ganham 3 meses de acesso grátis',
    'referral.step3': 'Você ganha 3 meses adicionais de acesso grátis para cada indicação bem-sucedida',
    'referral.step4': 'Acompanhe seu progresso e ganhos nas estatísticas acima',
    'referral.refreshStats': 'Atualizar Estatísticas',
    'referral.refreshing': 'Atualizando...',
    'referral.linkCopied': 'Link de indicação copiado para a área de transferência!',
    'referral.openingWhatsApp': 'Abrindo WhatsApp...',
    'referral.openingEmail': 'Abrindo cliente de email...',
    'referral.shareMessage': 'Junte-se ao Serviço de Notícias Perkins e ganhe 3 meses grátis! Use meu código de indicação: {code}',
    'referral.emailSubject': 'Junte-se ao Serviço de Notícias Perkins - 3 Meses Grátis!',
    'referral.emailBody': 'Olá!\n\nEstou usando o Serviço de Notícias Perkins e pensei que você poderia se interessar. É uma ótima maneira de se manter atualizado com notícias de negócios.\n\nVocê pode obter 3 meses de acesso grátis usando meu código de indicação: {code}\n\nRegistre-se aqui: {url}\n\nAtenciosamente!',
    
    // Password
    'password.title': 'Alterar Senha',
    'password.currentPassword': 'Senha Atual',
    'password.newPassword': 'Nova Senha',
    'password.confirmNewPassword': 'Confirmar Nova Senha',
    'password.updatePassword': 'Alterar Senha',
    'password.passwordUpdated': 'Senha atualizada com sucesso!',
    'password.passwordsDontMatch': 'As novas senhas não coincidem',
    'password.requirements': 'Requisitos da senha:',
    'password.requirementsText': 'A senha deve ter pelo menos 8 caracteres e conter maiúsculas, minúsculas, números e caracteres especiais.',
    'password.changing': 'Alterando senha...',
    'password.enterCurrentPassword': 'Digite sua senha atual',
    'password.enterNewPassword': 'Digite sua nova senha',
    'password.confirmNewPasswordPlaceholder': 'Confirme sua nova senha',
    'password.failedToChange': 'Erro ao alterar senha',
    'password.unexpectedError': 'Ocorreu um erro inesperado ao alterar a senha',
    
    // Delete Account
    'deleteAccount.title': 'Excluir Conta',
    'deleteAccount.warning': 'Esta ação não pode ser desfeita. Todos os seus dados, preferências e informações da conta serão excluídos permanentemente.',
    'deleteAccount.confirmDelete': 'Excluir Conta',
    'deleteAccount.accountDeleted': 'Conta excluída com sucesso. Você será redirecionado para a página de login.',
    'deleteAccount.enterPassword': 'Por favor, digite sua senha para confirmar a exclusão da conta',
    'deleteAccount.confirmPassword': 'Confirmar Senha',
    'deleteAccount.enterPasswordToConfirm': 'Digite sua senha para confirmar',
    'deleteAccount.deleting': 'Excluindo conta...',
    'deleteAccount.failedToDelete': 'Erro ao excluir conta',
    'deleteAccount.unexpectedError': 'Ocorreu um erro inesperado ao excluir a conta',
    'deleteAccount.loseAccess': 'Ao excluir sua conta, você perderá acesso a todos os seus feeds de notícias personalizados, preferências e benefícios de indicação.',
    
    // Sign Up
    'signup.title': 'Junte-se ao Serviço de Notícias Perkins',
    'signup.subtitle': 'Obtenha 3 meses de acesso grátis a notícias de negócios personalizadas',
    'signup.email': 'Email',
    'signup.password': 'Senha',
    'signup.confirmPassword': 'Confirmar Senha',
    'signup.referralCode': 'Código de Indicação (Opcional)',
    'signup.enterEmail': 'Digite seu email',
    'signup.createPassword': 'Crie uma senha',
    'signup.confirmPasswordPlaceholder': 'Confirme sua senha',
    'signup.enterReferralCode': 'Digite código de indicação se tiver um',
    'signup.createAccount': 'Criar Conta',
    'signup.creatingAccount': 'Criando conta...',
    'signup.accountCreated': 'Conta criada com sucesso! Por favor, verifique seu email para confirmar sua conta.',
    'signup.validEmail': 'Por favor, digite um email válido',
    'signup.passwordsDontMatch': 'As senhas não coincidem',
    'signup.validReferralCode': '✅ Código de indicação válido! Você ganhará 3 meses de acesso grátis.',
    'signup.invalidReferralCode': '❌ Código de indicação inválido. Você ainda pode se registrar por 3 meses grátis.',
    'signup.errorValidatingCode': '❌ Erro ao validar código de indicação.',
    'signup.termsAgreement': 'Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade',
    'signup.errorDuringSignup': 'Ocorreu um erro durante o registro',
    'signup.unexpectedError': 'Ocorreu um erro inesperado durante o registro',
    'signup.invalidUserAttributes': 'Atributos de usuário inválidos',
    
    // Inactivity Warning
    'inactivity.title': 'Aviso de Inatividade',
    'inactivity.message': 'Por sua segurança, você será desconectado em menos de {minutes} minuto(s). Você quer permanecer conectado?',
    'inactivity.logout': 'Sair',
    'inactivity.stayLoggedIn': 'Permanecer Conectado',
    
    // Auth Error
    'authError.title': 'Erro de Autenticação',
    'authError.message': 'Houve um problema com sua autenticação. Por favor, tente novamente ou saia e entre novamente.',
    'authError.technicalDetails': 'Detalhes Técnicos',
    'authError.tryAgain': 'Tentar Novamente',
    'authError.logout': 'Sair',
    
    // User Settings
    'userSettings.title': 'Configurações',
    'userSettings.changePassword': 'Alterar Senha',
    'userSettings.changePasswordDesc': 'Atualizar a senha da sua conta',
    'userSettings.deleteAccount': 'Excluir Conta',
    'userSettings.deleteAccountDesc': 'Excluir permanentemente sua conta e todos os dados',
    'userSettings.inviteFriends': 'Convidar Amigos',
    'userSettings.inviteFriendsDesc': 'Compartilhe seu código de indicação e ganhe meses grátis',
    
    // Disclaimer
    'disclaimer.text': 'As notícias podem sofrer atraso de alguns minutos, dependendo da publicação da fonte e da frequência de busca.',
  }
};

// Initialize Amplify i18n with our custom translations
I18n.putVocabularies(translations);
I18n.putVocabularies(customTranslations);

// Helper function to get translations
export const t = (key: string): string => {
  return I18n.get(key) || key;
};

// Hook to use translations
export const useTranslation = () => {
  return {
    t: (key: string): string => {
      return t(key);
    }
  };
}; 